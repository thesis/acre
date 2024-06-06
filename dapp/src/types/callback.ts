import { TransactionError } from "./ledger-live-app"

export type OnSuccessCallback = () => void

export type OnErrorCallback = (error: TransactionError) => void
