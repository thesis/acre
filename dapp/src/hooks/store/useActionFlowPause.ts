import { setStatus } from "#/store/action-flow"
import { PROCESS_STATUSES } from "#/types"
import { useAppDispatch } from "./useAppDispatch"

/**
 * Custom hook that provides functions to pause and resume the action flow process.
 * @returns An object containing the `handlePause` and `handleResume` functions.
 */
export function useActionFlowPause() {
  const dispatch = useAppDispatch()

  /**
   * Function to pause the action flow process.
   * It dispatches an action to set the status to "PAUSED" if the current status is "PENDING".
   */
  const handlePause = () => {
    dispatch(setStatus(PROCESS_STATUSES.PAUSED))
  }

  /**
   * Function to resume the action flow process.
   * It dispatches an action to set the status to "PENDING".
   */
  const handleResume = () => {
    dispatch(setStatus(PROCESS_STATUSES.PENDING))
  }

  return { handlePause, handleResume }
}
