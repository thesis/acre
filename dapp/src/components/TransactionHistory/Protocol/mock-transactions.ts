import { createTransactionInfo } from "#/tests/factories"
import { StakeHistory } from "#/types"

export const TRANSACTIONS: StakeHistory[] = Array.from({ length: 22 }, () => {
  const callTx = createTransactionInfo()
  return {
    callTx,
    receiptTx: createTransactionInfo({
      amount: callTx.amount,
      action: "receive",
      chain: "ethereum",
      account: "0x208e94d5661a73360d9387d3ca169e5c130090cd",
      txHash:
        "0xf612b8999e765f9631c5e32a9f424a097936da1c527953e78dc8da20f65bc3ee",
      currency: "bitcoin",
    }),
  }
})
