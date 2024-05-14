declare module "@swan-bitcoin/xpub-lib" {
  /**
   * Derivation purpose as defined in BIP 44.
   */
  enum Purpose {
    /**
     * BIP 44: Pay To Pubkey Hash (addresses starting with 1).
     */
    P2PKH = "44", // 1...
    /**
     * BIP 49: Pay To Witness Pubkey Hash nested in Pay To Script Hash (addresses
     * starting with 3).
     */
    P2SH = "49", // 3...
    /**
     * BIP 84: Pay To Witness Pubkey Hash (addresses starting with bc1).
     */
    P2WPKH = "84", // bc1...
  }

  const addressFromExtPubKey: (xpubData: {
    /**
     * Extended Public Key.
     */
    extPubKey: string

    /**
     * Change (0 = external chain, 1 = internal chain / change). Default `0`.
     */
    change?: number

    /**
     * The unhardened key index. Default `0`.
     */
    keyIndex?: number

    /**
     * The derivation purpose. The `P2WPKH` is used as default.
     */
    purpose?: Purpose

    /**
     * The target network (testnet or mainnet). If no network is specified the
     * library defaults to testnet.
     */
    network?: "mainnet" | "testnet"
  }) => { address: string; path: string }
}
