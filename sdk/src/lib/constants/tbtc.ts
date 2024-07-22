import { BitcoinNetwork } from "../bitcoin"

const NETWORK_TO_TBTC_DEPOSIT_BITCOIN_RECOVERY_ADDRESS: Record<
  BitcoinNetwork,
  string
> = {
  mainnet: "bc1qhv2fuyy3pessde3cdgtlrpz3mufytf8en2wr28",
  testnet: "tb1qtzhpl9sc3t0s2yhq5sevl3qklfduxym3twcn6v",
}

export default {
  NETWORK_TO_TBTC_DEPOSIT_BITCOIN_RECOVERY_ADDRESS,
}
