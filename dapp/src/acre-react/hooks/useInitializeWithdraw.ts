import { useCallback } from "react"
import {
  MessageSignedStepCallback,
  OnSignMessageStepCallback,
} from "@acre-btc/sdk/dist/src/lib/redeemer-proxy"
import { useAcreContext } from "./useAcreContext"

export default function useInitializeWithdraw() {
  const { acre, isConnected } = useAcreContext()

  return useCallback(
    async (
      amount: bigint,
      onSignMessageStep?: OnSignMessageStepCallback,
      messageSignedStep?: MessageSignedStepCallback,
    ) => {
      if (!acre || !isConnected) throw new Error("Account not connected")

      return acre.account.initializeWithdrawal(
        amount,
        onSignMessageStep,
        messageSignedStep,
      )
    },
    [acre, isConnected],
  )
}
