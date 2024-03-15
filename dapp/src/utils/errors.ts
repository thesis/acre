export const ERRORS = {
  SIGNING: "Message signing interrupted.",
  DEPOSIT_TRANSACTION: "Deposit transaction execution interrupted.",
  WALLET_NOT_CONNECTED: (type: string) => `${type} wallet is not connected.`,
}
