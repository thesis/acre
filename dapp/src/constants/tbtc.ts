import { BitcoinNetwork } from "@acre-btc/sdk"
import chains from "./chains"

const NETWORK_TO_TBTC_DEPOSIT_BITCOIN_RECOVERY_ADDRESS: Record<
  BitcoinNetwork,
  string
> = {
  mainnet: "bc1qhv2fuyy3pessde3cdgtlrpz3mufytf8en2wr28",
  testnet: "tb1qtzhpl9sc3t0s2yhq5sevl3qklfduxym3twcn6v",
}

const DEPOSIT_BITCOIN_RECOVERY_ADDRESS =
  NETWORK_TO_TBTC_DEPOSIT_BITCOIN_RECOVERY_ADDRESS[chains.BITCOIN_NETWORK]

export default {
  DEPOSIT_BITCOIN_RECOVERY_ADDRESS,
}
