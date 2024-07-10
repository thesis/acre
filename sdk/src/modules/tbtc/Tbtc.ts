import {
  ChainIdentifier,
  TBTC as TbtcSdk,
  RedeemerProxy,
  EthereumBridge,
  BitcoinAddressConverter,
  BitcoinHashUtils,
} from "@keep-network/tbtc-v2.ts"

import { ethers } from "ethers"
import TbtcApi, { DepositStatus } from "../../lib/api/TbtcApi"
import { BitcoinDepositor } from "../../lib/contracts"
import {
  Hex,
  IEthereumSignerCompatibleWithEthersV5 as EthereumSignerCompatibleWithEthersV5,
} from "../../lib/utils"

import Deposit from "./Deposit"
import { BitcoinNetwork } from "../../lib/bitcoin"

/**
 * Represents the tBTC module.
 */
export default class Tbtc {
  readonly #tbtcApi: TbtcApi

  readonly #tbtcSdk: TbtcSdk

  readonly #bitcoinDepositor: BitcoinDepositor

  readonly #network: BitcoinNetwork

  constructor(
    tbtcApi: TbtcApi,
    tbtcSdk: TbtcSdk,
    bitcoinDepositor: BitcoinDepositor,
    network: BitcoinNetwork,
  ) {
    this.#tbtcApi = tbtcApi
    this.#tbtcSdk = tbtcSdk
    this.#bitcoinDepositor = bitcoinDepositor
    this.#network = network
  }

  /**
   * Initializes the Tbtc module.
   *
   * @param signer The Ethereum signer compatible with ethers v5.
   * @param network The Ethereum network.
   * @param tbtcApiUrl The tBTC API URL.
   * @param bitcoinDepositor The Bitcoin depositor contract handle.
   * @returns A Promise that resolves to an instance of Tbtc.
   */
  static async initialize(
    signer: EthereumSignerCompatibleWithEthersV5,
    network: BitcoinNetwork,
    tbtcApiUrl: string,
    bitcoinDepositor: BitcoinDepositor,
  ): Promise<Tbtc> {
    const tbtcApi = new TbtcApi(tbtcApiUrl)

    const tbtcSdk =
      network === BitcoinNetwork.Mainnet
        ? // @ts-expect-error We require the `signer` must include the ethers v5
          // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
          // ethers v6 it won't break the Acre SDK initialization.
          await TbtcSdk.initializeMainnet(signer)
        : // @ts-expect-error We require the `signer` must include the ethers v5
          // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
          // ethers v6 it won't break the Acre SDK initialization.
          await TbtcSdk.initializeSepolia(signer)

    return new Tbtc(tbtcApi, tbtcSdk, bitcoinDepositor, network)
  }

  /**
   * Function to initialize a tBTC deposit. It submits deposit data to the tBTC
   * API and returns the deposit object.
   * @param depositOwner Ethereum address of the deposit owner.
   * @param bitcoinRecoveryAddress P2PKH or P2WPKH Bitcoin address that can be
   *        used for emergency recovery of the deposited funds.
   * @param referral Deposit referral number.
   */
  async initiateDeposit(
    depositOwner: ChainIdentifier,
    bitcoinRecoveryAddress: string,
    referral: number,
  ): Promise<Deposit> {
    if (!depositOwner || !bitcoinRecoveryAddress) {
      throw new Error("Ethereum or Bitcoin address is not available")
    }

    const extraData = this.#bitcoinDepositor.encodeExtraData(
      depositOwner,
      referral,
    )

    const tbtcDeposit = await this.#tbtcSdk.deposits.initiateDepositWithProxy(
      bitcoinRecoveryAddress,
      this.#bitcoinDepositor,
      extraData,
    )

    const receipt = tbtcDeposit.getReceipt()

    const revealData = {
      address: depositOwner.identifierHex,
      revealInfo: {
        depositor: receipt.depositor.identifierHex,
        blindingFactor: receipt.blindingFactor.toString(),
        walletPublicKeyHash: receipt.walletPublicKeyHash.toString(),
        refundPublicKeyHash: receipt.refundPublicKeyHash.toString(),
        refundLocktime: receipt.refundLocktime.toString(),
        extraData: receipt.extraData!.toString(),
      },
      metadata: {
        depositOwner: depositOwner.identifierHex,
        referral,
      },
      application: "acre",
    }

    const revealSaved: boolean = await this.#tbtcApi.saveReveal(revealData)
    if (!revealSaved)
      throw new Error("Reveal not saved properly in the database")

    return new Deposit(this.#tbtcApi, tbtcDeposit, revealData)
  }

  /**
   * @param depositOwner Depositor as EVM-chain identifier.
   * @returns All owner deposits, including queued deposits.
   */
  async getDepositsByOwner(depositOwner: ChainIdentifier): Promise<
    {
      txHash: string
      depositKey: string
      initialAmount: bigint
      status: DepositStatus
      timestamp: number
    }[]
  > {
    const deposits = await this.#tbtcApi.getDepositsByOwner(depositOwner)

    return deposits.map((deposit) => ({
      status: deposit.status,
      initialAmount: BigInt(deposit.initialAmount),
      depositKey: ethers.solidityPackedKeccak256(
        ["bytes32", "uint32"],
        [
          Hex.from(deposit.txHash).reverse().toPrefixedString(),
          deposit.outputIndex,
        ],
      ),
      txHash: deposit.txHash,
      timestamp: deposit.createdAt,
    }))
  }

  /**
   * Requests a redemption of TBTC v2 token into BTC. It builds the redemption
   * data and handles the redemption request through the provided redeemer
   * proxy.
   * @param bitcoinRedeemerAddress Bitcoin address the redeemed BTC should be
   *        sent to. Only P2PKH, P2WPKH, P2SH, and P2WSH address types are
   *        supported.
   * @param amount The amount to be redeemed in 1e18 tBTC token precision.
   * @param redeemerProxy Object implementing functions required to route tBTC
   *        redemption requests through the tBTC bridge.
   * @returns The transaction hash and redemption key.
   */
  async initiateRedemption(
    destinationBitcoinAddress: string,
    tbtcAmount: bigint,
    redeemerProxy: RedeemerProxy,
  ): Promise<{ transactionHash: string; redemptionKey: string }> {
    const { targetChainTxHash, walletPublicKey } =
      await this.#tbtcSdk.redemptions.requestRedemptionWithProxy(
        destinationBitcoinAddress,
        tbtcAmount,
        redeemerProxy,
      )

    const redeemerOutputScript = BitcoinAddressConverter.addressToOutputScript(
      destinationBitcoinAddress,
      this.#network,
    )

    const redemptionKey = EthereumBridge.buildRedemptionKey(
      BitcoinHashUtils.computeHash160(walletPublicKey),
      redeemerOutputScript,
    )

    return {
      transactionHash: targetChainTxHash.toPrefixedString(),
      redemptionKey,
    }
  }
}
