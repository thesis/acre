import { SafeTransactionData } from "@orangekit/sdk"

export { SafeTransactionData }

/**
 * Interface for communication with Bitcoin Wallet.
 */
export interface AcreBitcoinProvider {
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
   * @returns A signature for a given message, which proves that the owner of
   *          the account has agreed to the message content.
   */
  signMessage(message: string): Promise<string>

  /**
   * @returns The public key of the Bitcoin account.
   */
  getPublicKey(): Promise<string>

  /**
   * Signs withdraw message. This function is optional and if it is not
   * implemented the `signMessage` function will be used to sign the withdrawal
   * message.
   * @param message Message to sign.
   * @param data Withdrawal transaction data. @returns A signature for a given
   * message, which proves that the owner of the account has agreed to the
   *          message content.
   */
  signWithdrawMessage?(
    message: string,
    data: SafeTransactionData,
  ): Promise<string>
}
