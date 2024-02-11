import { ChainIdentifier } from "./chain-identifier"

export interface StBTC {
  balanceOf(identifier: ChainIdentifier): Promise<bigint>

  assetsBalanceOf(identifier: ChainIdentifier): Promise<bigint>
}
