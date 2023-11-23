import { TxHistory } from "../types"

export const MOCK_ALL_TRANSACTIONS: TxHistory[] = [
  {
    callTx: {
      timestamp: 1700179973,
      action: "Stake",
      asset: "BTC",
      amount: 2.24,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "Completed",
    },
    receiptTx: {
      timestamp: 1700179973,
      action: "Receive",
      asset: "stBTC",
      amount: 2.24,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "Completed",
    },
  },
  {
    callTx: {
      timestamp: 1700578973,
      action: "Unstake",
      asset: "stBTC",
      amount: 6.14,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "Completed",
    },
    receiptTx: {
      timestamp: 1700578973,
      action: "Receive",
      asset: "BTC",
      amount: 6.14,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "Completed",
    },
  },
  {
    callTx: {
      timestamp: 1700579973,
      action: "Stake",
      asset: "BTC",
      amount: 3.11,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "Completed",
    },
    receiptTx: {
      timestamp: 1700579973,
      action: "Receive",
      asset: "stBTC",
      amount: 3.11,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "Completed",
    },
  },
]

export const MOCK_USER_TRANSACTIONS: TxHistory[] = [
  {
    callTx: {
      timestamp: 1700579973,
      action: "Stake",
      asset: "BTC",
      amount: 3.11,
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: "Completed",
    },
    receiptTx: {
      timestamp: 1700579973,
      action: "Receive",
      asset: "stBTC",
      amount: 3.11,
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: "Completed",
    },
  },
]
