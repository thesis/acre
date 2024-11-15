import {
  DATE_FORMAT_LOCALE_TAG,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ONE_MINUTE_IN_SECONDS,
  ONE_SEC_IN_MILLISECONDS,
} from "#/constants"
import { TimeUnits } from "#/types"
import { DateTime } from "luxon"

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

export const timestampToRelativeTime = (timestamp: number) =>
  DateTime.fromMillis(timestamp).toRelative()

export const blockTimestampToRelativeTime = (
  unixTimestamp: number,
): string | null => {
  const time = unixTimestamp * ONE_SEC_IN_MILLISECONDS
  return timestampToRelativeTime(time)
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

  return blockTimestampToRelativeTime(blockTimestamp)
}

export const getExpirationDate = (duration: number, startDate?: Date) => {
  const date = startDate ?? new Date()
  return new Date(date.getTime() + duration)
}

/**
 * Returns the expiration timestamp from the start date considering the specified duration.
 * If the startDate is not passed, the function will take the current time as the start date.
 */
export const getExpirationTimestamp = (duration: number, startDate?: Date) =>
  dateToUnixTimestamp(getExpirationDate(duration, startDate))
