type Network = "mainnet" | "testnet"

declare module "@swan-bitcoin/xpub-lib" {
  const addressFromExtPubKey: (xpubData: {
    extPubKey: string
    network: Network
  }) => { address: string }
}
