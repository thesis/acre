import { time } from "#/constants"
import { TimeUnits } from "#/types"
import { DateTime } from "luxon"

const dateToUnixTimestamp = (date: Date = new Date()) =>
  Math.floor(date.getTime() / time.ONE_SEC_IN_MILLISECONDS)

const unixTimestampToTimeUnits = (targetUnix: number): TimeUnits => {
  const days = Math.floor(targetUnix / time.ONE_DAY_IN_SECONDS)
  const hours = Math.floor(
    (targetUnix % time.ONE_DAY_IN_SECONDS) / time.ONE_HOUR_IN_SECONDS,
  )
  const minutes = Math.floor(
    (targetUnix % time.ONE_HOUR_IN_SECONDS) / time.ONE_MINUTE_IN_SECONDS,
  )
  const seconds = Math.floor(targetUnix % time.ONE_MINUTE_IN_SECONDS)

  return {
    days: days.toString(),
    hours: hours.toString(),
    minutes: minutes.toString(),
    seconds: seconds.toString(),
  }
}

const timestampToRelativeTime = (timestamp: number) =>
  DateTime.fromMillis(timestamp).toRelative()

const blockTimestampToRelativeTime = (unixTimestamp: number): string | null =>
  timestampToRelativeTime(unixTimestamp * time.ONE_SEC_IN_MILLISECONDS)

// The function displays the date in the format: 21 Nov 2024, 16:02
const formatBlockTimestamp = (blockTimestamp: number) =>
  new Date(blockTimestamp * time.ONE_SEC_IN_MILLISECONDS).toLocaleString(
    time.DATE_FORMAT_LOCALE_TAG,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  )

const displayBlockTimestamp = (blockTimestamp: number) => {
  const diff = Math.round(dateToUnixTimestamp() - blockTimestamp)
  const executedMoreThanDayAgo = diff > time.ONE_DAY_IN_SECONDS

  if (executedMoreThanDayAgo) return formatBlockTimestamp(blockTimestamp)

  return blockTimestampToRelativeTime(blockTimestamp)
}

const getExpirationDate = (duration: number, startDate?: Date) => {
  const date = startDate ?? new Date()
  return new Date(date.getTime() + duration)
}

/**
 * Returns the expiration timestamp from the start date considering the specified duration.
 * If the startDate is not passed, the function will take the current time as the start date.
 */
const getExpirationTimestamp = (duration: number, startDate?: Date) =>
  dateToUnixTimestamp(getExpirationDate(duration, startDate))

export default {
  dateToUnixTimestamp,
  unixTimestampToTimeUnits,
  timestampToRelativeTime,
  blockTimestampToRelativeTime,
  formatBlockTimestamp,
  displayBlockTimestamp,
  getExpirationDate,
  getExpirationTimestamp,
}
