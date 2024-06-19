// TODO: This is just a temporary interface that should be replaced by the
// `OrangeKitBitcoinWalletProvider` from the `orangekit` library.
/**
 * Interface for communication with Bitcoin Wallet.
 */
export interface BitcoinProvider {
  /**
   * Acre SDK must rely on the `BitcoinProvider` implementation to get the
   * bitcoin address because different wallets use different strategies. For
   * example in Ledger Live Wallet API the address is "renewed" each time funds
   * are received in order to allow some privacy. In that case, always getting
   * the same Bitcoin address should be hidden under a given implementation.
   *
   * @returns Bitcoin address selected by the user.
   */
  getAddress(): Promise<string>

  /**
   * Signs message.
   * @param message Message to sign.
   * @returns Hash of the signed message.
   */
  signMessage(message: string): Promise<string>

  /**
   * @returns The public key of the Bitcoin account.
   */
  getPublicKey(): Promise<string>
}
