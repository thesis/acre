import { ActivityInfo } from "#/types"

export const mockedActivities: ActivityInfo[] = [
  {
    amount: 324000000,
    action: "stake",
    currency: "bitcoin",
    txHash: "2dc2341e6c8463b8731eeb356e52acb7",
    status: "syncing",
  },
  {
    amount: 524000000,
    action: "unstake",
    currency: "bitcoin",
    txHash: "92eb5ffee6ae2fec3ad71c777531578f",
    status: "pending",
  },
  {
    amount: 224000000,
    action: "receive",
    currency: "bitcoin",
    txHash: "0cc175b9c0f1b6a831c399e269772661",
    status: "completed",
  },
]
