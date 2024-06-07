import { OrangeKitSdk } from "@orangekit/sdk"
import { AcreContracts } from "../lib/contracts"
import StakeInitialization from "./staking"
import { toSatoshi } from "../lib/utils"
import Tbtc from "./tbtc"
import AcreSubgraphApi from "../lib/api/AcreSubgraphApi"
import { DepositStatus } from "../lib/api/TbtcApi"
import WithdrawalService from "./withdrawal-service"
import { EthereumAddress } from "../lib/ethereum"

/**
 * Represents the deposit data
 */
export type Deposit = {
  /**
   * Unique deposit identifier represented as
   * `keccak256(bitcoinFundingTxHash | fundingOutputIndex)`.
   */
  id: string
  /**
   * Bitcoin transaction hash (or transaction ID) in the same byte order as
   * used by the Bitcoin block explorers.
   */
  txHash: string
  /**
   * Amount of Bitcoin funding transaction.
   */
  amount: bigint
  /**
   * Status of the deposit.
   */
  status: DepositStatus
  /**
   * Timestamp when the deposit was initialized.
   */
  timestamp: number
}

/**
 * Module exposing features related to the account.
 */
export default class Account {
  /**
   * Acre contracts.
   */
  readonly #contracts: AcreContracts

  /**
   * tBTC Module.
   */
  readonly #tbtc: Tbtc

  /**
   * Acre subgraph api.
   */
  readonly #acreSubgraphApi: AcreSubgraphApi

  readonly #bitcoinAddress: string

  readonly #ethereumAddress: EthereumAddress

  readonly #withdrawalService: WithdrawalService

  constructor(
    contracts: AcreContracts,
    tbtc: Tbtc,
    acreSubgraphApi: AcreSubgraphApi,
    orangeKit: OrangeKitSdk,
    accountData: {
      bitcoinAddress: string
      ethereumAddress: string
      publicKey: string
    },
  ) {
    this.#contracts = contracts
    this.#tbtc = tbtc
    this.#acreSubgraphApi = acreSubgraphApi
    this.#bitcoinAddress = accountData.bitcoinAddress
    this.#ethereumAddress = EthereumAddress.from(accountData.ethereumAddress)
    this.#withdrawalService = new WithdrawalService(
      contracts,
      tbtc,
      orangeKit,
      accountData,
    )
  }

  /**
   * Initializes the Acre deposit process.
   * @param referral Data used for referral program.
   * @param bitcoinRecoveryAddress `P2PKH` or `P2WPKH` Bitcoin address that can
   *        be used for emergency recovery of the deposited funds. If
   *        `undefined` the bitcoin address from bitcoin provider is used as
   *        bitcoin recovery address - note that an address returned by bitcoin
   *        provider must then be `P2WPKH` or `P2PKH`. This property is
   *        available to let the consumer use `P2SH-P2WPKH` as the deposit owner
   *        and another tBTC-supported type (`P2WPKH`, `P2PKH`) address as the
   *        tBTC Bridge recovery address.
   * @returns Object represents the deposit process.
   */
  async initializeStake(
    referral: number,
    bitcoinRecoveryAddress?: string,
  ): Promise<StakeInitialization> {
    // tBTC-v2 SDK will handle Bitcoin address validation and throw an error if
    // address is not supported.
    const finalBitcoinRecoveryAddress =
      bitcoinRecoveryAddress ?? this.#bitcoinAddress

    const tbtcDeposit = await this.#tbtc.initiateDeposit(
      this.#ethereumAddress,
      finalBitcoinRecoveryAddress,
      referral,
    )

    return new StakeInitialization(tbtcDeposit)
  }

  /**
   * Initializes the withdrawal process.
   * @param referral Data used for referral program.

   * @returns Object represents the deposit process.
   */
  async initializeWithdrawal(
    sharesAmount: bigint,
    bitcoinSignMessageFn: (message: string) => Promise<string>,
  ) {
    return this.#withdrawalService.initiateWithdrawal(
      this.#bitcoinAddress,
      sharesAmount,
      bitcoinSignMessageFn,
    )
  }

  /**
   * @returns Value of the basis for calculating final BTC balance in 1e18
   *          precision.
   */
  async sharesBalance() {
    return this.#contracts.stBTC.balanceOf(this.#ethereumAddress)
  }

  /**
   * @returns Maximum withdraw value in 1e8 satoshi precision.
   */
  async estimatedBitcoinBalance() {
    return toSatoshi(
      await this.#contracts.stBTC.assetsBalanceOf(this.#ethereumAddress),
    )
  }

  /**
   * @returns All deposits associated with the Bitcoin address that returns the
   *          Bitcoin Provider. They include all deposits: queued, initialized
   *          and finalized.
   */
  async getDeposits(): Promise<Deposit[]> {
    const subgraphData = await this.#acreSubgraphApi.getDepositsByOwner(
      this.#ethereumAddress,
    )

    const initializedOrFinalizedDepositsMap = new Map(
      subgraphData.map((data) => [data.depositKey, data]),
    )

    const tbtcData = await this.#tbtc.getDepositsByOwner(this.#ethereumAddress)

    return tbtcData.map((deposit) => {
      const depositFromSubgraph = initializedOrFinalizedDepositsMap.get(
        deposit.depositKey,
      )

      const amount = toSatoshi(
        depositFromSubgraph?.initialAmount ?? deposit.initialAmount,
      )

      return {
        id: deposit.depositKey,
        txHash: deposit.txHash,
        amount,
        status: deposit.status,
        timestamp: deposit.timestamp,
      }
    })
  }
}
