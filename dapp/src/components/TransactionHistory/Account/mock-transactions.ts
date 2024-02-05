import { createTransactionInfo } from "#/tests/factories"
import { StakeHistory } from "#/types"

export const TRANSACTIONS: StakeHistory[] = [
  {
    callTx: createTransactionInfo({
      status: "syncing",
      amount: 224000000,
    }),
    receiptTx: createTransactionInfo({
      amount: 224000000,
      action: "receive",
      currency: "bitcoin",
      chain: "ethereum",
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash: undefined,
      status: undefined,
    }),
  },
]
