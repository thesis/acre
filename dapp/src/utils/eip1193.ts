import {
  EIP1193Error,
  EIP1193ErrorCodeNumbers,
  EIP1193_ERROR_CODES,
} from "#/types"
import { isNumber, isObject, isString } from "./type-check"

function isEIP1193ErrorCodeNumber(
  code: unknown,
): code is EIP1193ErrorCodeNumbers {
  return (
    isNumber(code) &&
    Object.values(EIP1193_ERROR_CODES)
      .map((e) => e.code as number)
      .includes(code)
  )
}

function isEIP1193Error(arg: unknown): arg is EIP1193Error {
  return (
    isObject(arg) &&
    isNumber(arg.code) &&
    isEIP1193ErrorCodeNumber(arg.code) &&
    isString(arg.message)
  )
}

export default {
  isEIP1193Error,
  isEIP1193ErrorCodeNumber,
}
