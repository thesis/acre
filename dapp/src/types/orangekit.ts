export type OrangeKitError = Error & {
  cause?: { code: number }
}
