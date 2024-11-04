import { AcreDappBitcoinProvider, OrangeKitConnector } from "#/types"
import { acreApi, orangeKit } from "#/utils"
import { SignInWithWalletMessage } from "@orangekit/sign-in-with-wallet"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

function useSignSignInMessage() {
  const queryClient = useQueryClient()
  return useMutation<
    string,
    unknown,
    {
      provider: AcreDappBitcoinProvider
      message: string
      data: SignInWithWalletMessage
    }
  >(
    {
      mutationKey: ["signSignInMessage"],
      mutationFn: async ({ provider, message, data }) =>
        provider?.signSignInMessage?.(message, data) ??
        provider.signMessage(message),
    },
    queryClient,
  )
}

function useSignMessageAndCreateSession() {
  const {
    mutateAsync: signMessageAsync,
    status: signMessageStatus,
    reset: resetMessageStatus,
  } = useSignSignInMessage()

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

      const { message, data } = orangeKit.createSignInWithWalletMessage(
        btcAddress,
        session.nonce,
      )
      const provider = connectedConnector.getBitcoinProvider()

      const signedMessage = await signMessageAsync({
        provider,
        message,
        data,
      })

      const publicKey = await connectedConnector
        .getBitcoinProvider()
        .getPublicKey()

      await acreApi.createSession(message, signedMessage, publicKey)
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
