export const PARTNERS = {
  LEDGER_LIVE: "ledger-live",
  XVERSE: "xverse",
} as const

export type Partner = (typeof PARTNERS)[keyof typeof PARTNERS]
