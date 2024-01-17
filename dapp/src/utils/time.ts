import {
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_MINUTE_IN_SECONDS,
  ONE_MONTH_IN_SECONDS,
  ONE_SEC_IN_MILLISECONDS,
  ONE_WEEK_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
} from "#/constants"

const dateToUnixTimestamp = (date: Date = new Date()) =>
  Math.floor(date.getTime() / ONE_SEC_IN_MILLISECONDS)

// unit, max diff, divisor
const unitsToDivisor: [Intl.RelativeTimeFormatUnit, number, number][] = [
  ["second", ONE_MINUTE_IN_SECONDS, 1],
  ["minute", ONE_HOUR_IN_SECONDS, ONE_MINUTE_IN_SECONDS],
  ["hour", ONE_DAY_IN_SECONDS, ONE_HOUR_IN_SECONDS],
  ["day", ONE_WEEK_IN_SECONDS, ONE_DAY_IN_SECONDS],
  ["week", ONE_MONTH_IN_SECONDS, ONE_WEEK_IN_SECONDS],
  ["month", ONE_YEAR_IN_SECONDS, ONE_MONTH_IN_SECONDS],
  ["year", Infinity, ONE_YEAR_IN_SECONDS],
]
const rtf = new Intl.RelativeTimeFormat("en-gb")

/**
 * The problem of displaying relative time has already been solved in Threshold Network
 * Let's use this logic to be able to display relative time such as: 2 mins ago, 3 hours ago...
 *
 * Source:
 * https://github.com/threshold-network/token-dashboard/blob/main/src/utils/date.ts#L48-L61
 */
export const getRelativeTime = (dateOrUnixTimestamp: Date | number): string => {
  const time =
    typeof dateOrUnixTimestamp === "number"
      ? dateOrUnixTimestamp
      : dateToUnixTimestamp(dateOrUnixTimestamp)

  const diff = Math.round(time - dateToUnixTimestamp())

  const [unit, , divisor] =
    unitsToDivisor.find(([, maxDiff]) => maxDiff > Math.abs(diff)) ??
    unitsToDivisor[0]

  return rtf.format(Math.floor(diff / divisor), unit)
}

// The function displays the date in the format: 21/11/2023, 16:02
export const formatBlockTimestamp = (blockTimestamp: number) =>
  new Date(blockTimestamp * ONE_SEC_IN_MILLISECONDS).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  })

export const displayBlockTimestamp = (blockTimestamp: number) => {
  const diff = Math.round(dateToUnixTimestamp() - blockTimestamp)
  const executedMoreThanDayAgo = diff > ONE_DAY_IN_SECONDS

  if (executedMoreThanDayAgo) return formatBlockTimestamp(blockTimestamp)

  return getRelativeTime(blockTimestamp)
}
