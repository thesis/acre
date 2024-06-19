export const STATUSES = {
  IDLE: "IDLE",
  PENDING: "PENDING",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const

export type Status = (typeof STATUSES)[keyof typeof STATUSES]
