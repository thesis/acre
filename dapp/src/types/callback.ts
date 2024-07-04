export type OnSuccessCallback = () => void

export type OnErrorCallback<ErrorType = unknown> = (error: ErrorType) => void
