import { StakeHistory } from "#/types"

export const TRANSACTIONS: StakeHistory[] = [
  {
    callTx: {
      timestamp: 1700179973,
      chain: "bitcoin",
      action: "stake",
      asset: {
        currency: "bitcoin",
        amount: 224440000,
      },
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "completed",
    },
    receiptTx: {
      timestamp: 1700179973,
      chain: "ethereum",
      action: "receive",
      asset: {
        currency: "stbtc",
        amount: 224000000,
      },
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "completed",
    },
  },
  {
    callTx: {
      timestamp: 1700578973,
      chain: "bitcoin",
      action: "unstake",
      asset: {
        currency: "stbtc",
        amount: 614000000,
      },
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "pending",
    },
    receiptTx: {
      timestamp: 1700578973,
      chain: "ethereum",
      action: "receive",
      asset: {
        currency: "bitcoin",
        amount: 614000000,
      },
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "pending",
    },
  },
  {
    callTx: {
      timestamp: 1700608973,
      chain: "bitcoin",
      action: "unstake",
      asset: {
        currency: "stbtc",
        amount: 321000000,
      },
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "syncing",
    },
    receiptTx: {
      timestamp: 1700608973,
      chain: "ethereum",
      action: "receive",
      asset: {
        currency: "bitcoin",
        amount: 321000000,
      },
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "syncing",
    },
  },
]
