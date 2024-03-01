import { BitcoinDepositor } from "./bitcoin-depositor"

export * from "./bitcoin-depositor"
export * from "./chain-identifier"
export * from "./depositor-proxy"

/**
 * Represents all contracts that allow interaction with the Acre network.
 */
export type AcreContracts = {
  bitcoinDepositor: BitcoinDepositor
}
