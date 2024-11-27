import * as Sentry from "@sentry/react"
import * as CryptoJS from "crypto-js"

const initialize = (dsn: string) => {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.captureConsoleIntegration({ levels: ["error"] }),
      Sentry.extraErrorDataIntegration(),
      Sentry.httpClientIntegration(),
    ],
    // Attach stacktrace to errors logged by `console.error`. This is useful for
    // the `captureConsoleIntegration` integration.
    attachStacktrace: true,
    // Performance Monitoring
    tracesSampleRate: 0.1,
  })
}

/**
 * Sets the user in Sentry with an ID from hashed Bitcoin address.
 * The Bitcoin address is first converted to lowercase and then hashed using SHA-256.
 * The resulting hash is then converted to a hexadecimal string and the first 10
 * characters are set as the user ID.
 *
 * @param bitcoinAddress - The Bitcoin address of the user. If undefined, the user
 * is set to null in Sentry.
 */
const setUser = (bitcoinAddress: string | undefined) => {
  if (!bitcoinAddress) {
    Sentry.setUser(null)
    return
  }

  const hashedBitcoinAddress = CryptoJS.SHA256(
    bitcoinAddress.toLowerCase(),
  ).toString(CryptoJS.enc.Hex)

  const id = hashedBitcoinAddress.slice(0, 10)

  Sentry.setUser({ id })
}

const captureException = (exception: unknown) =>
  Sentry.captureException(exception)

export default {
  initialize,
  setUser,
  captureException,
}
