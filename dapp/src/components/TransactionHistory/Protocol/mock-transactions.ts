import { StakeHistory } from "#/types"

export const TRANSACTIONS: StakeHistory[] = [
  {
    callTx: {
      timestamp: 1700179973,
      chain: "bitcoin",
      action: "stake",
      asset: {
        currency: "bitcoin",
        symbol: "BTC",
        amount: 224440000,
      },
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: 0,
    },
    receiptTx: {
      timestamp: 1700179973,
      chain: "ethereum",
      action: "receive",
      asset: {
        currency: "stbtc",
        symbol: "stBTC",
        amount: 224000000,
      },
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: 0,
    },
  },
  {
    callTx: {
      timestamp: 1700578973,
      chain: "bitcoin",
      action: "unstake",
      asset: {
        currency: "stbtc",
        symbol: "stBTC",
        amount: 614000000,
      },
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: 0,
    },
    receiptTx: {
      timestamp: 1700578973,
      chain: "ethereum",
      action: "receive",
      asset: {
        currency: "bitcoin",
        symbol: "BTC",
        amount: 614000000,
      },
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: 0,
    },
  },
  {
    callTx: {
      timestamp: 1700608973,
      chain: "bitcoin",
      action: "unstake",
      asset: {
        currency: "stbtc",
        symbol: "stBTC",
        amount: 321000000,
      },
      account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
      txHash:
        "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
      status: 0,
    },
    receiptTx: {
      timestamp: 1700608973,
      chain: "ethereum",
      action: "receive",
      asset: {
        currency: "bitcoin",
        symbol: "BTC",
        amount: 321000000,
      },
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      status: 0,
    },
  },
]
