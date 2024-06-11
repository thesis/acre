import { LedgerLiveError } from "#/types"

export function isObject(
  arg: unknown,
): arg is Record<string | number | symbol, unknown> {
  return typeof arg === "object" && arg !== null
}

export function isString(arg: unknown): arg is string {
  return typeof arg === "string"
}

export function isLedgerLiveError(arg: unknown): arg is LedgerLiveError {
  return isObject(arg) && arg.name === "Error" && isString(arg.message)
}
