import { OrangeKitConnector } from "#/types"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { acreApi, orangeKit } from "#/utils"
import { generateNonce } from "@orangekit/sign-in-with-wallet"
import { useCallback } from "react"
import { useSignMessage } from "wagmi"

function useSignMessageAndCreateSession() {
  const {
    signMessageAsync,
    status: signMessageStatus,
    reset: resetMessageStatus,
  } = useSignMessage()

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
      const nonce = generateNonce()
      const message = orangeKit.createSignInWithWalletMessage(btcAddress, nonce)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const signedMessage = await signMessageAsync({
        message,
        connector: orangeKit.typeConversionToConnector(connectedConnector),
      })

      // const publicKey = await connectedConnector
      //   .getBitcoinProvider()
      //   .getPublicKey()

      // await acreApi.createSession(message, signedMessage, publicKey)
    },
    [signMessageAsync],
  )

  return {
    signMessageStatus,
    resetMessageStatus,
    signMessageAndCreateSession,
  }
}
export default useSignMessageAndCreateSession
