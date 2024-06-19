import { LedgerLiveError } from "#/types"

export function isObject(
  arg: unknown,
): arg is Record<string | number | symbol, unknown> {
  return typeof arg === "object" && arg !== null && !Array.isArray(arg)
}

export function isString(arg: unknown): arg is string {
  return typeof arg === "string"
}

export function isNumber(arg: unknown): arg is number {
  return typeof arg === "number"
}

export function isLedgerLiveError(arg: unknown): arg is LedgerLiveError {
  return isObject(arg) && arg.name === "Error" && isString(arg.message)
}
