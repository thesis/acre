import { TBTCDepositor } from "./tbtc-depositor"

export * from "./tbtc-depositor"
export * from "./chain-identifier"

/**
 * Represents all contracts that allow interaction with the Acre network.
 */
export type AcreContracts = {
  depositor: TBTCDepositor
}
