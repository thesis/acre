import { useCallback } from "react"
import {
  MessageSignedStepCallback,
  OnSignMessageStepCallback,
} from "@acre-btc/sdk/dist/src/lib/redeemer-proxy"
import { useAcreContext } from "./useAcreContext"

export default function useInitializeWithdraw() {
  const { acre } = useAcreContext()

  return useCallback(
    async (
      amount: bigint,
      onSignMessageStep?: OnSignMessageStepCallback,
      messageSignedStep?: MessageSignedStepCallback,
    ) => {
      if (!acre) return

      await acre.account.initializeWithdrawal(
        amount,
        onSignMessageStep,
        messageSignedStep,
      )
    },
    [acre],
  )
}
