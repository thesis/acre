import {
  EIP1193Error,
  EIP1193ErrorCodeNumbers,
  EIP1193_ERROR_CODES,
} from "#/types"
import typeCheck from "./type-check"

const { isNumber, isObject, isString } = typeCheck

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

function didUserRejectRequest(error: unknown): boolean {
  const { code } = EIP1193_ERROR_CODES.userRejectedRequest

  return isEIP1193Error(error) && error.code === code
}

export default {
  isEIP1193Error,
  isEIP1193ErrorCodeNumber,
  didUserRejectRequest,
}
