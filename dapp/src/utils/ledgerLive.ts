import { LedgerLiveError } from "#/types"
import { isObject, isString } from "./type-check"

function isLedgerLiveError(arg: unknown): arg is LedgerLiveError {
  return isObject(arg) && arg.name === "Error" && isString(arg.message)
}
function didUserRejectRequest(error: unknown): boolean {
  return !!(
    isLedgerLiveError(error) &&
    error.message &&
    error.message.includes("Signature interrupted by user")
  )
}

export default {
  isLedgerLiveError,
  didUserRejectRequest,
}
