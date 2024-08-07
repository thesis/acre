import { Activity } from "#/types"
import { dateToUnixTimestamp, randomInteger } from "#/utils"

export const createActivity = (
  overrides: Partial<Activity> = {},
): Activity => ({
  id: crypto.randomUUID(),
  initializedAt: dateToUnixTimestamp() - randomInteger(0, 1000000),
  amount: BigInt(randomInteger(1000000, 1000000000)),
  txHash: "c9625ecc138bbd241439f158f65f43e152968ff35e203dec89cfb78237d6a2d8",
  status: "completed",
  type: "deposit",
  ...overrides,
})
