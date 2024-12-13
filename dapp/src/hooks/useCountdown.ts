import { useState, useEffect } from "react"
import { TimeUnits } from "#/types"
import { time } from "#/constants"
import { timeUtils, numbersUtils } from "#/utils"

/**
 * It was decided to use an already implemented hook used by Threshold Network.
 * Hook allows us to count down the time until the specified date and.
 * After time has passed we can call the specified action.
 *
 * Source:
 * https://github.com/threshold-network/components/blob/main/src/hooks/useCountdown.ts
 */
const useCountdown = (
  targetDateInUnix: number,
  addLeadingZeroes?: boolean,
  onComplete?: (targetDateInUnix: number) => void,
): TimeUnits => {
  const [diff, setDiff] = useState(
    targetDateInUnix - timeUtils.dateToUnixTimestamp(),
  )

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const newDiff = targetDateInUnix - timeUtils.dateToUnixTimestamp()
      if (newDiff === 0) {
        if (onComplete) {
          onComplete(targetDateInUnix)
        }
        clearInterval(countdownInterval)
      }

      setDiff(newDiff)
    }, time.ONE_SEC_IN_MILLISECONDS)

    return () => clearInterval(countdownInterval)
  }, [targetDateInUnix, onComplete])

  let { days, hours, minutes, seconds } =
    timeUtils.unixTimestampToTimeUnits(diff)

  if (addLeadingZeroes) {
    days = numbersUtils.addLeadingZero(Number(days))
    hours = numbersUtils.addLeadingZero(Number(hours))
    minutes = numbersUtils.addLeadingZero(Number(minutes))
    seconds = numbersUtils.addLeadingZero(Number(seconds))
  }

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}

export default useCountdown
