import React from "react"
import { UseStakeFlowReturn, useStakeFlow } from "#/acre-react/hooks"

export const StakeFlowContext = React.createContext<UseStakeFlowReturn>({
  initStake: async () => {},
  signMessage: async () => {},
  stake: async () => {},
})

export function StakeFlowProvider({ children }: { children: React.ReactNode }) {
  const stakeFlow = useStakeFlow()

  return (
    <StakeFlowContext.Provider value={stakeFlow}>
      {children}
    </StakeFlowContext.Provider>
  )
}
