import { LedgerLiveError } from "#/types"

export function getType(arg: unknown): string {
  return Object.prototype.toString.call(arg).slice("[object ".length, -1)
}

export function isObject(
  arg: unknown,
): arg is Record<string | number | symbol, unknown> {
  return typeof arg === "object" && arg !== null
}

export function isString(arg: unknown): arg is string {
  return getType(arg) === "String"
}

export function isNumber(arg: unknown): arg is number {
  return getType(arg) === "Number"
}

export function isLedgerLiveError(arg: unknown): arg is LedgerLiveError {
  return isObject(arg) && arg.name === "Error" && isString(arg.message)
}
