import {
  ChainIdentifier,
  TBTC as TbtcSdk,
  RedeemerProxy,
} from "@keep-network/tbtc-v2.ts"

import { ethers } from "ethers"
import TbtcApi, { DepositStatus } from "../../lib/api/TbtcApi"
import { BitcoinDepositor } from "../../lib/contracts"
import { EthereumNetwork } from "../../lib/ethereum"
import {
  Hex,
  IEthereumSignerCompatibleWithEthersV5 as EthereumSignerCompatibleWithEthersV5,
} from "../../lib/utils"

import Deposit from "./Deposit"

/**
 * Represents the tBTC module.
 */
export default class Tbtc {
  readonly #tbtcApi: TbtcApi

  readonly #tbtcSdk: TbtcSdk

  readonly #bitcoinDepositor: BitcoinDepositor

  constructor(
    tbtcApi: TbtcApi,
    tbtcSdk: TbtcSdk,
    bitcoinDepositor: BitcoinDepositor,
  ) {
    this.#tbtcApi = tbtcApi
    this.#tbtcSdk = tbtcSdk
    this.#bitcoinDepositor = bitcoinDepositor
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
    network: EthereumNetwork,
    tbtcApiUrl: string,
    bitcoinDepositor: BitcoinDepositor,
  ): Promise<Tbtc> {
    const tbtcApi = new TbtcApi(tbtcApiUrl)

    const tbtcSdk =
      network === "mainnet"
        ? // @ts-expect-error We require the `signer` must include the ethers v5
          // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
          // ethers v6 it won't break the Acre SDK initialization.
          await TbtcSdk.initializeMainnet(signer)
        : // @ts-expect-error We require the `signer` must include the ethers v5
          // signer's methods used in tBTC-v2.ts SDK so if we pass signer from
          // ethers v6 it won't break the Acre SDK initialization.
          await TbtcSdk.initializeSepolia(signer)

    return new Tbtc(tbtcApi, tbtcSdk, bitcoinDepositor)
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

  async initiateRedemption(
    destinationBitcoinAddress: string,
    tbtcAmount: number,
    redeemer: RedeemerProxy,
  ): Promise<string> {
    const { targetChainTxHash } =
      await this.#tbtcSdk.redemptions.requestRedemptionWithProxy(
        destinationBitcoinAddress,
        tbtcAmount,
        redeemer,
      )

    return targetChainTxHash.toPrefixedString()
  }
}
