// eslint-disable-next-line max-classes-per-file
import { BitcoinNetwork } from "../bitcoin"
import { ChainIdentifier } from "../contracts"
import { Hex } from "../utils"
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
      events: { type: "Initialized" | "Finalized"; timestamp: string }[]
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
  /**
   * Timestamp when the deposit was initialized.
   */
  timestamp: number
}

type WithdrawalsDataResponse = {
  data: {
    withdraws: {
      id: string
      bitcoinTransactionId: string
      amount: string
    }[]
  }
}

type Withdraw = {
  id: string
  amount: bigint
  bitcoinTransactionId?: string
}

type SearchRedemptionDataResponse = {
  data: {
    searchRedemption: {
      id: string
      completedTxHash?: string
    }[]
  }
}

export function buildGetDepositsByOwnerQuery(owner: ChainIdentifier) {
  return `
  query {
    deposits(
          where: {depositOwner_: {id: "0x${owner.identifierHex}"}}
      ) {
          id
          bitcoinTransactionId
          initialDepositAmount
          events(orderBy: timestamp, orderDirection: asc) {
            timestamp
            type
          }
          amountToDeposit
      }
  }`
}

export function buildGetWithdrawalsByOwnerQuery(owner: ChainIdentifier) {
  return `
  query {
    withdraws(
      where: {depositOwner_contains_nocase: "0x${owner.identifierHex}"}
    ) {
        id
        bitcoinTransactionId
        amount
      }
  }`
}

function buildSearchRedemptionsByIdQuery(redemptionIds: string[]) {
  // id = <redemption_key>-<counter>
  const ids = redemptionIds.map((id) => {
    const [redemptionKey] = id.split("-")
    return redemptionKey
  })

  // Queries with multiple search terms separated by the or operator will return
  // all entities with a match from any of the provided terms.
  // Ref: https://thegraph.com/docs/en/querying/graphql-api/#fulltext-search-queries
  const searchText = ids.join(" | ")

  return `
    query {
      searchRedemption( text: "${searchText}" ) {
        id
        completedTxHash
      }
    }
  `
}
class TbtcSubgraph extends HttpApi {
  async getRedemptionsByIds(
    redemptionIds: string[],
  ): Promise<SearchRedemptionDataResponse["data"]["searchRedemption"]> {
    const query = buildSearchRedemptionsByIdQuery(redemptionIds)

    const response = await this.postRequest(
      "",
      { query },
      { credentials: undefined },
    )

    if (!response.ok) {
      throw new Error(`Could not get redemptions by ids: ${response.status}`)
    }

    const responseData = (await response.json()) as SearchRedemptionDataResponse

    return responseData.data.searchRedemption
  }
}

/**
 * Class for integration with Acre Subgraph.
 */
export default class AcreSubgraphApi extends HttpApi {
  // TODO: set the correct url for mainnet
  readonly #tbtcSubgraph: TbtcSubgraph

  constructor(network: BitcoinNetwork) {
    // TODO: set mainnet api url
    const acreSubgraphApiUrl =
      network === BitcoinNetwork.Testnet
        ? // TODO: set correct url.
          "https://api.studio.thegraph.com/query/73600/acre-development/version/latest"
        : ""
    const tbtcSubgraphApi =
      network === BitcoinNetwork.Testnet
        ? "https://api.studio.thegraph.com/proxy/59264/threshold-tbtc-sepolia/version/latest"
        : ""

    super(acreSubgraphApiUrl)
    this.#tbtcSubgraph = new TbtcSubgraph(tbtcSubgraphApi)
  }

  /**
   * @param depositOwnerId The deposit owner id as EVM-chain identifier.
   * @returns All deposits for a given depositor. Returns only initialized or
   *          finalized deposits that exist on-chain. They do not included
   *          queued deposits stored by the tBTC API.
   */
  async getDepositsByOwner(
    depositOwnerId: ChainIdentifier,
  ): Promise<Deposit[]> {
    const query = buildGetDepositsByOwnerQuery(depositOwnerId)
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

      const timestamp = parseInt(events[0].timestamp, 10)

      return {
        depositKey: id,
        txHash,
        initialAmount: BigInt(initialDepositAmount),
        amountToDeposit: BigInt(amountToDeposit ?? 0),
        type: "deposit",
        status,
        timestamp,
      }
    })
  }

  async getWithdrawalsByOwner(
    depositOwnerId: ChainIdentifier,
  ): Promise<Withdraw[]> {
    const query = buildGetWithdrawalsByOwnerQuery(depositOwnerId)

    const response = await this.postRequest(
      "",
      { query },
      { credentials: undefined },
    )

    if (!response.ok) {
      throw new Error(
        `Could not get withdrawals by deposit owner: ${response.status}`,
      )
    }

    const acreWithdrawals = (await response.json()) as WithdrawalsDataResponse
    const ids = acreWithdrawals.data.withdraws.map((withdraw) => withdraw.id)

    const tbtcRedemptionsResponse =
      await this.#tbtcSubgraph.getRedemptionsByIds(ids)

    const redemptionToBitcoinTx = new Map(
      tbtcRedemptionsResponse.map((redemption) => {
        const [redemptionKey, counter] = redemption.id.split("-")
        return [
          // In Acre we count withdrawals with the same redemption key from 1
          // but the tBTC subgraph counts from 0.
          `${redemptionKey}-${Number(counter) + 1}`,
          redemption.completedTxHash,
        ]
      }),
    )

    return acreWithdrawals.data.withdraws.map((withdraw) => {
      const bitcoinTxHash = redemptionToBitcoinTx.get(withdraw.id)
      const bitcoinTransactionId = bitcoinTxHash
        ? Hex.from(bitcoinTxHash).reverse().toString()
        : undefined

      return {
        id: withdraw.id,
        bitcoinTransactionId,
        amount: BigInt(withdraw.amount),
      }
    })
  }
}
