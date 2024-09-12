import { OrangeKitConnector } from "#/types"
import { acreApi, orangeKit } from "#/utils"
import { useCallback } from "react"
import { useSignMessage } from "wagmi"

function useSignMessageAndCreateSession() {
  const { signMessageAsync, status: signMessageStatus } = useSignMessage()

  const signMessageAndCreateSession = useCallback(
    async (connectedConnector: OrangeKitConnector, btcAddress: string) => {
      let session = await acreApi.getSession()
      const hasSessionAddress = "address" in session

      const isSessionAddressEqual = hasSessionAddress
        ? (session as { address: string }).address === btcAddress
        : false

      if (hasSessionAddress && isSessionAddressEqual) {
        return
      }

      if (hasSessionAddress && !isSessionAddressEqual) {
        // Delete session.
        await acreApi.deleteSession()
        // Ask for nonce to create new session.
        session = await acreApi.getSession()
      }

      if (!("nonce" in session)) {
        throw new Error("Session nonce not available")
      }

      const message = orangeKit.createSignInWithWalletMessage(
        btcAddress,
        session.nonce,
      )

      const signedMessage = await signMessageAsync({
        message,
        connector: orangeKit.typeConversionToConnector(connectedConnector),
      })

      const publicKey = await connectedConnector
        .getBitcoinProvider()
        .getPublicKey()

      await acreApi.createSession(message, signedMessage, publicKey)
    },
    [signMessageAsync],
  )

  return {
    signMessageAndCreateSession,
    signMessageStatus,
  }
}
export default useSignMessageAndCreateSession
