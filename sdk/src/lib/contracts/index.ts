import { BitcoinDepositor } from "./bitcoin-depositor"
import { StBTC } from "./stbtc"

export * from "./bitcoin-depositor"
export * from "./chain-identifier"
export * from "./stbtc"
export * from "./depositor-proxy"

/**
 * Represents all contracts that allow interaction with the Acre network.
 */
export type AcreContracts = {
  bitcoinDepositor: BitcoinDepositor
  stBTC: StBTC
}
