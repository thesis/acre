import { ChainIdentifier } from "@keep-network/tbtc-v2.ts"
import HttpApi from "./HttpApi"
import { DepositStatus } from "./TbtcApi"

/**
 * Represents the response data returned form the Acre Subgraph from query that
 * finds all deposits for a given depositor.
 */
type DepositDataResponse = {
  data: {
    deposits: {
      /**
       * Unique deposit identifier represented as
       * `keccak256(bitcoinFundingTxHash | fundingOutputIndex)`.
       */
      id: string
      /**
       * Bitcoin transaction hash (or transaction ID) in the same byte order as
       * used by the Bitcoin block explorers.
       */
      bitcoinTransactionId: string
      /**
       * Amount of tBTC tokens deposited to stBTC vault - it's equal to
       * `bridgedAmount - depositorFee` (without the stBTC deposit fee).
       */
      amountToDeposit: string
      /**
       * Amount of Bitcoin funding transaction.
       */
      initialDepositAmount: string
      /**
       * Events associated with a given deposit.
       */
      events: { type: "Initialized" | "Finalized" }[]
    }[]
  }
}

/**
 * Represents the formatted deposit.
 */
type Deposit = {
  /**
   * Unique deposit identifier represented as `keccak256(bitcoinFundingTxHash |
   * fundingOutputIndex)`.
   */
  depositKey: string
  /**
   * Bitcoin transaction hash (or transaction ID) in the same byte order as used
   * by the Bitcoin block explorers.
   */
  txHash: string
  /**
   * Amount of Bitcoin funding transaction.
   */
  initialAmount: bigint
  /**
   * Amount of tBTC tokens deposited to stBTC vault - it's equal to
   * `bridgedAmount - depositorFee` (without the stBTC deposit fee).
   */
  amountToDeposit: bigint
  /**
   * Status of the deposit.
   */
  status: DepositStatus
}

/**
 * Class for integration with Acre Subgraph.
 */
export default class AcreSubgraphApi extends HttpApi {
  /**
   * @param depositOwnerId The deposit owner id as EVM-chain identifier.
   * @returns All deposits for a given depositor. Returns only initialized or
   *          finalized deposits that exist on-chain. They do not included
   *          queued deposits stored by the tBTC API.
   */
  async getDepositsByOwner(
    depositOwnerId: ChainIdentifier,
  ): Promise<Deposit[]> {
    const query = `
    query {
      deposits(
            where: {depositOwner_: {id: "0x${depositOwnerId.identifierHex}"}}
        ) {
            id
            bitcoinTransactionId
            initialDepositAmount
            events {
                type
            }
            amountToDeposit
        }
    }`
    const response = await this.postRequest(
      "",
      { query },
      { credentials: undefined },
    )

    if (!response.ok) {
      throw new Error(
        `Could not get deposits by deposit owner: ${response.status}`,
      )
    }

    const responseData = (await response.json()) as DepositDataResponse

    return responseData.data.deposits.map((deposit) => {
      const {
        bitcoinTransactionId: txHash,
        amountToDeposit,
        initialDepositAmount,
        events,
        id,
      } = deposit

      // The subgraph indexes only initialized or finalized deposits.
      const status = events.some(({ type }) => type === "Finalized")
        ? DepositStatus.Finalized
        : DepositStatus.Initialized

      return {
        depositKey: id,
        txHash,
        initialAmount: BigInt(initialDepositAmount),
        amountToDeposit: BigInt(amountToDeposit ?? 0),
        type: "deposit",
        status,
      }
    })
  }
}
