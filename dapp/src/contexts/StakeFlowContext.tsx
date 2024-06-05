import React, { useCallback, useMemo } from "react"
import {
  UseStakeFlowReturn,
  useAcreContext,
  useStakeFlow,
} from "#/acre-react/hooks"
import { REFERRAL } from "#/constants"

type StakeFlowContextValue = Omit<UseStakeFlowReturn, "initStake"> & {
  initStake: () => Promise<void>
}

export const StakeFlowContext = React.createContext<StakeFlowContextValue>({
  initStake: async () => {},
  stake: async () => {},
})

export function StakeFlowProvider({ children }: { children: React.ReactNode }) {
  const { acre } = useAcreContext()
  const {
    initStake: acreInitStake,
    btcAddress,
    depositReceipt,
    stake,
  } = useStakeFlow()

  const initStake = useCallback(async () => {
    if (!acre) throw new Error("Acre SDK not defined")

    await acreInitStake(REFERRAL)
  }, [acreInitStake, acre])

  const context = useMemo(
    () => ({
      initStake,
      btcAddress,
      depositReceipt,
      stake,
    }),
    [initStake, btcAddress, depositReceipt, stake],
  )

  return (
    <StakeFlowContext.Provider value={context}>
      {children}
    </StakeFlowContext.Provider>
  )
}
