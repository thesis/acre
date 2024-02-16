import { ActivityInfo } from "#/types"

export const mockedActivities: ActivityInfo[] = [
  {
    amount: 324000000,
    action: "stake",
    currency: "bitcoin",
    chain: "ethereum",
    account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
    txHash: "2dc2341e6c8463b8731eeb356e52acb7",
    status: "syncing",
  },
  {
    amount: 524000000,
    action: "unstake",
    currency: "bitcoin",
    chain: "ethereum",
    account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
    txHash: "92eb5ffee6ae2fec3ad71c777531578f",
    status: "pending",
  },
  {
    amount: 224000000,
    action: "receive",
    currency: "bitcoin",
    chain: "ethereum",
    account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
    txHash: "0cc175b9c0f1b6a831c399e269772661",
    status: "completed",
  },
]
