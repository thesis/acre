import { StakeHistory } from "#/types"

export const TRANSACTIONS: StakeHistory[] = [
  {
    callTx: {
      timestamp: 1700179973,
      action: "stake",
      asset: "BTC",
      amount: 2.24,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "completed",
    },
    receiptTx: {
      timestamp: 1700179973,
      action: "receive",
      asset: "stBTC",
      amount: 2.24,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "completed",
    },
  },
  {
    callTx: {
      timestamp: 1700578973,
      action: "unstake",
      asset: "stBTC",
      amount: 6.14,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "pending",
    },
    receiptTx: {
      timestamp: 1700578973,
      action: "receive",
      asset: "BTC",
      amount: 6.14,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "pending",
    },
  },
  {
    callTx: {
      timestamp: 1700608973,
      action: "unstake",
      asset: "stBTC",
      amount: 32.1,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "syncing",
    },
    receiptTx: {
      timestamp: 1700608973,
      action: "receive",
      asset: "BTC",
      amount: 32.1,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "syncing",
    },
  },
]
