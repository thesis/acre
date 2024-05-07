import axios from "axios"
import { Activity, ActivityDataResponse } from "#/types"

const {
  VITE_USE_LOCALHOST_SUBGRAPH,
  VITE_SUBGRAPH_LOCALHOST_URL,
  VITE_SUBGRAPH_ID,
  VITE_SUBGRAPH_API_KEY,
} = import.meta.env

const ACRE_SUBGRAPH_URL = (() => {
  switch (VITE_USE_LOCALHOST_SUBGRAPH) {
    case "true":
      return VITE_SUBGRAPH_LOCALHOST_URL
    case "false":
      return `https://gateway-testnet-arbitrum.network.thegraph.com/api/${VITE_SUBGRAPH_API_KEY}/subgraphs/id/${VITE_SUBGRAPH_ID}`
    default:
      return ""
  }
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
 * Returns the  activities for the owner of the deposit..
 * @param depositOwner Deposit owner's Ethereum address.
 */
async function fetchActivityDatas(depositOwner: string): Promise<Activity[]> {
  const response = await axios.post<{
    errors?: unknown
    data: { activityDatas: ActivityDataResponse[] }
  }>(ACRE_SUBGRAPH_URL, {
    query: `query {
            activityDatas(
              where: {depositOwner_: {id: "${depositOwner}"}}
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
  fetchActivityDatas,
}
