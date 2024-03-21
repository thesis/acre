import { useState, useEffect } from "react"
import { TimeUnits } from "#/types"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"
import {
  addLeadingZero,
  dateToUnixTimestamp,
  unixTimestampToTimeUnits,
} from "../utils"

/**
 * It was decided to use an already implemented hook used by Threshold Network.
 * Hook allows us to count down the time until the specified date and.
 * After time has passed we can call the specified action.
 *
 * Source:
 * https://github.com/threshold-network/components/blob/main/src/hooks/useCountdown.ts
 */
export const useCountdown = (
  targetDateInUnix: number,
  addLeadingZeroes?: boolean,
  onComplete?: (targetDateInUnix: number) => void,
): TimeUnits => {
  const [diff, setDiff] = useState(targetDateInUnix - dateToUnixTimestamp())

  useEffect(() => {
    const interval = setInterval(() => {
      const newDiff = targetDateInUnix - dateToUnixTimestamp()
      if (newDiff === 0) {
        if (onComplete) {
          onComplete(targetDateInUnix)
        }
        clearInterval(interval)
      }

      setDiff(newDiff)
    }, ONE_SEC_IN_MILLISECONDS)

    return () => clearInterval(interval)
  }, [targetDateInUnix, onComplete])

  let { days, hours, minutes, seconds } = unixTimestampToTimeUnits(diff)

  if (addLeadingZeroes) {
    days = addLeadingZero(Number(days))
    hours = addLeadingZero(Number(hours))
    minutes = addLeadingZero(Number(minutes))
    seconds = addLeadingZero(Number(seconds))
  }

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}
