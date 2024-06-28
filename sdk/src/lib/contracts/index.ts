import { BitcoinDepositor } from "./bitcoin-depositor"
import { StBTC } from "./stbtc"
import { BitcoinRedeemer } from "./bitcoin-redeemer"

export * from "./bitcoin-depositor"
export * from "./chain-identifier"
export * from "./stbtc"
export * from "./depositor-proxy"
export * from "./bitcoin-redeemer"

/**
 * Represents all contracts that allow interaction with the Acre network.
 */
export type AcreContracts = {
  bitcoinDepositor: BitcoinDepositor
  stBTC: StBTC
  bitcoinRedeemer: BitcoinRedeemer
}
