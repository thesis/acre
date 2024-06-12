export const EIP1193_ERROR_CODES = {
  userRejectedRequest: {
    code: 4001,
    message: "The user rejected the request.",
  },
} as const

export type EIP1193Error =
  (typeof EIP1193_ERROR_CODES)[keyof typeof EIP1193_ERROR_CODES]

export type EIP1193ErrorCodeNumbers = Pick<
  (typeof EIP1193_ERROR_CODES)[keyof typeof EIP1193_ERROR_CODES],
  "code"
>
