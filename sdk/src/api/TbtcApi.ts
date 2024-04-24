import { BitcoinTxHash, BitcoinTxOutpoint } from "@keep-network/tbtc-v2.ts"
import HttpApi from "./HttpApi"

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
type SaveRevealRequest = {
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
enum DepositStatus {
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
