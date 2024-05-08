import axios from "axios"
import { Activity, ActivityDataResponse } from "#/types"

const {
  VITE_SUBGRAPH_LOCALHOST_URL,
  VITE_SUBGRAPH_DEVELOPMENT_URL,
  VITE_SUBGRAPH_PRODUCTION_URL,
} = import.meta.env

const ACRE_SUBGRAPH_URL = (() => {
  if (import.meta.env.PROD) return VITE_SUBGRAPH_PRODUCTION_URL

  if (VITE_SUBGRAPH_LOCALHOST_URL) return VITE_SUBGRAPH_LOCALHOST_URL

  return VITE_SUBGRAPH_DEVELOPMENT_URL
})()

const mapToActivity = (activityData: ActivityDataResponse): Activity => {
  const { bitcoinTransactionId: txHash, amountToDeposit, events } = activityData

  const status = events.some(({ type }) => type === "Finalized")
    ? "completed"
    : "pending"

  return {
    txHash,
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
