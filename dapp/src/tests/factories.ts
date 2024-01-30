import { TransactionInfo } from "#/types"
import { dateToUnixTimestamp, randomInteger } from "#/utils"

export const createTransactionInfo = (
  overrides: Partial<TransactionInfo> = {},
): TransactionInfo => ({
  timestamp: dateToUnixTimestamp() - randomInteger(0, 1000000),
  chain: "bitcoin",
  action: "unstake",
  currency: "stbtc",
  amount: randomInteger(1000000, 1000000000),
  account: "2MsjRekULh27YSM17p8gSNkVvbXw6wc4kcZ",
  txHash: "925c8910775c1842fbcfee782104d0d9934dde6f0ca00d393858fcbe8ac90eb7",
  status: "completed",
  ...overrides,
})
