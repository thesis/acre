import React, { useCallback, useMemo } from "react"
import { UseStakeFlowReturn, useStakeFlow } from "#/acre-react/hooks"

type StakeFlowContextValue = Omit<UseStakeFlowReturn, "signMessage"> & {
  signMessage: (onSuccess: () => void) => Promise<void>
}

export const StakeFlowContext = React.createContext<StakeFlowContextValue>({
  initStake: async () => {},
  signMessage: async () => {},
  stake: async () => {},
})

export function StakeFlowProvider({ children }: { children: React.ReactNode }) {
  const stakeFlow = useStakeFlow()
  const { signMessage } = stakeFlow

  const handleSignMessage = useCallback(
    async (onSuccess: () => void) => {
      try {
        await signMessage()

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        console.error(error)
      }
    },
    [signMessage],
  )

  const contextValue: StakeFlowContextValue = useMemo<StakeFlowContextValue>(
    () => ({
      ...stakeFlow,
      signMessage: handleSignMessage,
    }),
    [handleSignMessage, stakeFlow],
  )

  return (
    <StakeFlowContext.Provider value={contextValue}>
      {children}
    </StakeFlowContext.Provider>
  )
}
