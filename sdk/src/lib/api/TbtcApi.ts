import {
  BitcoinTxHash,
  BitcoinTxOutpoint,
  ChainIdentifier,
} from "@keep-network/tbtc-v2.ts"
import { ethers } from "ethers"
import HttpApi from "./HttpApi"
import { Hex } from "../utils"

type Deposit<NumberType = string> = {
  id: string
  depositKey: string
  createdAt: number
  outputIndex: number
  owner: string
  receipt: {
    blindingFactor: string
    depositor: string
    extraData: string
    refundLocktime: string
    refundPublicKeyHash: string
    walletPublicKeyHash: string
  }
  referral: number
  status: DepositStatus
  txHash: string
  initialAmount: NumberType
}

/**
 * Represents a class for integration with tBTC API.
 */
export default class TbtcApi extends HttpApi {
  /**
   * Register deposit data in the tBTC API.
   * @param revealData Deposit data.
   * @returns True if the reveal was successfully saved to the database, false
   * otherwise.
   */
  async saveReveal(revealData: SaveRevealRequest): Promise<boolean> {
    const response = await this.postRequest("reveals", revealData)

    if (!response.ok)
      throw new Error(
        `Reveal not saved properly in the database, response: ${response.status}`,
      )

    const { success } = (await response.json()) as { success: boolean }

    return success
  }

  /**
   * Initiate a bitcoin deposit in the tBTC API.
   * @param depositData Data of the deposit.
   * @returns Details of the initiated deposit.
   */
  async createDeposit(depositData: CreateDepositRequest): Promise<{
    depositId: string
    depositStatus: DepositStatus
    fundingOutpoint: BitcoinTxOutpoint
  }> {
    const response = await this.postRequest("deposits", depositData)
    if (!response.ok)
      throw new Error(
        `Bitcoin deposit creation failed, response: ${response.status}`,
      )

    const responseData = (await response.json()) as CreateDepositResponse

    return {
      depositId: responseData.depositId,
      depositStatus: responseData.newDepositStatus,
      fundingOutpoint: {
        transactionHash: BitcoinTxHash.from(responseData.transactionHash),
        outputIndex: responseData.outputIndex,
      },
    }
  }

  async getDepositsByOwner(
    depositOwner: ChainIdentifier,
  ): Promise<Deposit<bigint>[]> {
    const response = await this.getRequest(
      `deposits/${depositOwner.identifierHex}`,
    )
    if (!response.ok)
      throw new Error(`Failed to fetch deposits: ${response.status}`)

    const responseData = (await response.json()) as Deposit[]

    return responseData.map((deposit) => ({
      ...deposit,
      initialAmount: BigInt(deposit.initialAmount),
      depositKey: ethers.solidityPackedKeccak256(
        ["bytes32", "uint32"],
        [
          Hex.from(deposit.txHash).reverse().toPrefixedString(),
          deposit.outputIndex,
        ],
      ),
    }))
  }
}

/**
 * Represents the metadata for a reveal operation.
 */
type RevealMetadata = {
  depositOwner: string
  referral: number
}

// TODO: This type is copied from tbtc-api, we should consider exporting it from there.
/**
 * Represents the request payload for saving a reveal.
 */
export type SaveRevealRequest = {
  address: string
  revealInfo: BitcoinDepositReceiptJson
  metadata: RevealMetadata
  application: string
}

// TODO: This type is copied from tbtc-api, we should consider exporting it from there.
/**
 * Represents the JSON structure of a Bitcoin deposit receipt.
 */
type BitcoinDepositReceiptJson = {
  depositor: string
  blindingFactor: string
  walletPublicKeyHash: string
  refundPublicKeyHash: string
  refundLocktime: string
  extraData: string
}

// TODO: This type is copied from tbtc-api, we should consider exporting it from there.
/**
 * Represents the request payload for creating a deposit.
 */
type CreateDepositRequest = {
  depositReceipt: BitcoinDepositReceiptJson
  depositOwner: string
  referral: number
}

// TODO: This type is copied from tbtc-api, we should consider exporting it from there.
/**
 * Represents the status of a deposit.
 */
export enum DepositStatus {
  Queued = "QUEUED",
  Initialized = "INITIALIZED",
  Finalized = "FINALIZED",
  Cancelled = "CANCELLED",
}

// TODO: This type is copied from tbtc-api, we should consider exporting it from there.
/**
 * Represents the response structure of a deposit creation request.
 */
type CreateDepositResponse = {
  depositId: string
  newDepositStatus: DepositStatus
  transactionHash: string
  outputIndex: number
}
