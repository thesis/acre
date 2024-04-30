import React, { useCallback, useMemo } from "react"
import {
  UseStakeFlowReturn,
  useAcreContext,
  useStakeFlow,
} from "#/acre-react/hooks"
import { REFERRAL } from "#/constants"

type StakeFlowContextValue = Omit<UseStakeFlowReturn, "initStake"> & {
  initStake: (
    bitcoinRecoveryAddress: string,
    ethereumAddress: string,
  ) => Promise<void>
}

export const StakeFlowContext = React.createContext<StakeFlowContextValue>({
  initStake: async () => {},
  signMessage: async () => {},
  stake: async () => {},
})

export function StakeFlowProvider({ children }: { children: React.ReactNode }) {
  const { acre } = useAcreContext()
  const {
    initStake: acreInitStake,
    signMessage,
    btcAddress,
    depositReceipt,
    stake,
  } = useStakeFlow()

  const initStake = useCallback(
    async (bitcoinRecoveryAddress: string, ethereumAddress: string) => {
      if (!acre) throw new Error("Acre SDK not defined")

      await acreInitStake(bitcoinRecoveryAddress, ethereumAddress, REFERRAL)
    },
    [acreInitStake, acre],
  )

  const context = useMemo(
    () => ({
      initStake,
      signMessage,
      btcAddress,
      depositReceipt,
      stake,
    }),
    [initStake, signMessage, btcAddress, depositReceipt, stake],
  )

  return (
    <StakeFlowContext.Provider value={context}>
      {children}
    </StakeFlowContext.Provider>
  )
}
