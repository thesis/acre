import axios from "axios"
import { Activity, ActivityDataResponse } from "#/types"

const ACRE_SUBGRAPH_URL = import.meta.env.VITE_ACRE_SUBGRAPH_URL

const mapToActivity = (activityData: ActivityDataResponse): Activity => {
  const {
    id,
    bitcoinTransactionId: txHash,
    amountToDeposit,
    events,
  } = activityData

  const status = events.some(({ type }) => type === "Finalized")
    ? "completed"
    : "pending"
  const timestamp = parseInt(events[0].timestamp, 10)

  return {
    id,
    txHash,
    timestamp,
    amount: BigInt(amountToDeposit),
    type: "deposit",
    status,
  }
}

// TODO: Fetch transactions for withdrawals
/**
 * Returns the activities for a given account.
 * @param account The Ethereum address for which the activities will be fetched.
 */
async function fetchActivityData(account: string): Promise<Activity[]> {
  const response = await axios.post<{
    errors?: unknown
    data: { activityDatas: ActivityDataResponse[] }
  }>(ACRE_SUBGRAPH_URL, {
    query: `query {
            activityDatas(
              where: {depositOwner_: {id: "${account}"}}
            ) {
              id
              bitcoinTransactionId
              events {
                timestamp,
                type
              }
              ... on Deposit {
                amountToDeposit
              }
            }
          }`,
  })

  if (response.data && response.data.errors) {
    const errorMsg = "Failed to fetch data from Acre subgraph API."
    console.error(errorMsg, response.data.errors)
    throw new Error(errorMsg)
  }

  return response.data.data.activityDatas.map(mapToActivity)
}

export const subgraphAPI = {
  fetchActivityData,
}
