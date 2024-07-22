import HttpApi from "./HttpApi"

type SearchRedemptionDataResponse = {
  data: {
    searchRedemption: {
      id: string
      completedTxHash?: string
    }[]
  }
}

export function buildSearchRedemptionsByIdQuery(redemptionIds: string[]) {
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

export default class TbtcSubgraphApi extends HttpApi {
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
