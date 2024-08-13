import {
  DATE_FORMAT_LOCALE_TAG,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_MINUTE_IN_SECONDS,
  ONE_MONTH_IN_SECONDS,
  ONE_SEC_IN_MILLISECONDS,
  ONE_WEEK_IN_SECONDS,
  ONE_YEAR_IN_SECONDS,
} from "#/constants"
import { TimeUnits } from "#/types"

export const dateToUnixTimestamp = (date: Date = new Date()) =>
  Math.floor(date.getTime() / ONE_SEC_IN_MILLISECONDS)

export const unixTimestampToTimeUnits = (targetUnix: number): TimeUnits => {
  const days = Math.floor(targetUnix / ONE_DAY_IN_SECONDS)
  const hours = Math.floor(
    (targetUnix % ONE_DAY_IN_SECONDS) / ONE_HOUR_IN_SECONDS,
  )
  const minutes = Math.floor(
    (targetUnix % ONE_HOUR_IN_SECONDS) / ONE_MINUTE_IN_SECONDS,
  )
  const seconds = Math.floor(targetUnix % ONE_MINUTE_IN_SECONDS)

  return {
    days: days.toString(),
    hours: hours.toString(),
    minutes: minutes.toString(),
    seconds: seconds.toString(),
  }
}

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
const rtf = new Intl.RelativeTimeFormat(DATE_FORMAT_LOCALE_TAG)

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

// The function displays the date in the format: 21 Nov 2024, 16:02
export const formatBlockTimestamp = (blockTimestamp: number) =>
  new Date(blockTimestamp * ONE_SEC_IN_MILLISECONDS).toLocaleString(
    DATE_FORMAT_LOCALE_TAG,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  )

export const displayBlockTimestamp = (blockTimestamp: number) => {
  const diff = Math.round(dateToUnixTimestamp() - blockTimestamp)
  const executedMoreThanDayAgo = diff > ONE_DAY_IN_SECONDS

  if (executedMoreThanDayAgo) return formatBlockTimestamp(blockTimestamp)

  return getRelativeTime(blockTimestamp)
}

/**
 * Returns the expiration timestamp from the start date considering the specified duration.
 * If the startDate is not passed, the function will take the current time as the start date.
 */
export const getExpirationTimestamp = (duration: number, startDate?: Date) => {
  const date = startDate ?? new Date()
  const expirationDate = new Date(date.getTime() + duration)

  return dateToUnixTimestamp(expirationDate)
}

export const isWithinPeriod = (
  timestamp: number,
  periodInMilliseconds: number,
) => Date.now() - timestamp <= periodInMilliseconds && timestamp <= Date.now()
