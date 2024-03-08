import { TBTCDepositor } from "./tbtc-depositor"
import { StBTC } from "./stbtc"

export * from "./tbtc-depositor"
export * from "./chain-identifier"
export * from "./stbtc"
export * from "./depositor-proxy"

/**
 * Represents all contracts that allow interaction with the Acre network.
 */
export type AcreContracts = {
  tbtcDepositor: TBTCDepositor
  stBTC: StBTC
}
