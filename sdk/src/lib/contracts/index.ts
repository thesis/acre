import { TBTCDepositor } from "./tbtc-depositor"

export * from "./tbtc-depositor"
export * from "./chain-identifier"
export * from "./depositor-proxy"

/**
 * Represents all contracts that allow interaction with the Acre network.
 */
export type AcreContracts = {
  tbtcDepositor: TBTCDepositor
}
