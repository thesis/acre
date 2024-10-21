import { OrangeKitConnector } from "#/types"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { acreApi, getExpirationDate, orangeKit } from "#/utils"
import { generateNonce } from "@orangekit/sign-in-with-wallet"
import { useCallback } from "react"
import { useSignMessage } from "wagmi"
import { ACRE_SESSION_EXPIRATION_TIME } from "#/constants"
import useLocalStorage from "./useLocalStorage"

const initialSession = { address: "", sessionId: 0 }

function useSignMessageAndCreateSession() {
  const {
    signMessageAsync,
    status: signMessageStatus,
    reset: resetMessageStatus,
  } = useSignMessage()

  // TODO: Temporary solution to mock the session mechanism for Ledger Live App
  // integration. To fully support the session mechanism exposed by Acre API
  // backend we need sign message with "zero" address not fresh address. This is
  // will be supported in future versions of Ledger Bitcoin App.
  const [session, setSession] = useLocalStorage<{
    address: string
    sessionId: number
  }>("acre.session", initialSession)
  const { address: sessionAddress, sessionId } = session

  const signMessageAndCreateSession = useCallback(
    async (connectedConnector: OrangeKitConnector, btcAddress: string) => {
      // const session = await acreApi.getSession()
      // const hasSessionAddress = "address" in session

      // const isSessionAddressEqual = hasSessionAddress
      //   ? (session as { address: string }).address === btcAddress
      //   : false

      // if (hasSessionAddress && isSessionAddressEqual) {
      //   return
      // }

      // if (hasSessionAddress && !isSessionAddressEqual) {
      //   // Delete session.
      //   await acreApi.deleteSession()
      //   // Ask for nonce to create new session.
      //   session = await acreApi.getSession()
      // }

      // if (!("nonce" in session)) {
      //   throw new Error("Session nonce not available")
      // }
      if (
        new Date(sessionId).getTime() > Date.now() &&
        btcAddress === sessionAddress
      ) {
        // The session is valid no need to sign message.
        return
      }

      const nonce = generateNonce()
      const message = orangeKit.createSignInWithWalletMessage(btcAddress, nonce)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const signedMessage = await signMessageAsync({
        message,
        connector: orangeKit.typeConversionToConnector(connectedConnector),
      })

      const newSessionId = getExpirationDate(
        ACRE_SESSION_EXPIRATION_TIME,
      ).getTime()
      setSession({ address: btcAddress, sessionId: newSessionId })

      // const publicKey = await connectedConnector
      //   .getBitcoinProvider()
      //   .getPublicKey()

      // await acreApi.createSession(message, signedMessage, publicKey)
    },
    [signMessageAsync, sessionAddress, sessionId, setSession],
  )

  return {
    signMessageStatus,
    resetMessageStatus,
    signMessageAndCreateSession,
  }
}
export default useSignMessageAndCreateSession
