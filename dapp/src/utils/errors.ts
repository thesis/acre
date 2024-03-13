export const ERRORS = {
  SIGNING: "Message signing error.",
  DEPOSIT_TRANSACTION: "Deposit transaction execution error.",
  WALLET_NOT_CONNECTED: (type: string) => `${type} wallet is not connected.`,
}
