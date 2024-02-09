import React, { useCallback, useMemo, useState } from "react"
import { EthereumAddress, StakeInitialization } from "@acre-btc/sdk"
import { useAcreContext } from "../AcreSdkContext"

type StakeFlowContextValue = {
  initStake: (
    bitcoinRecoveryAddress: string,
    ethereumAddress: string,
    referral: number,
  ) => Promise<void>
  btcAddress?: string
  signMessage: () => Promise<void>
  stake: () => Promise<void>
}

export const StakeFlowContext = React.createContext<StakeFlowContextValue>({
  initStake: async () => {},
  signMessage: async () => {},
  stake: async () => {},
})

export function StakeFlowProvider({ children }: { children: React.ReactNode }) {
  const { acre, isInitialized } = useAcreContext()

  const [stakeFlow, setStakeFlow] = useState<StakeInitialization | undefined>(
    undefined,
  )
  const [btcAddress, setBtcAddress] = useState<string | undefined>(undefined)

  const initStake = useCallback(
    async (
      bitcoinRecoveryAddress: string,
      ethereumAddress: string,
      referral: number,
    ) => {
      if (!acre || !isInitialized) throw new Error("Acre SDK not defined")

      const initializedStakeFlow = await acre.staking.initializeStake(
        bitcoinRecoveryAddress,
        EthereumAddress.from(ethereumAddress),
        referral,
      )

      const btcDepositAddress = await initializedStakeFlow.getBitcoinAddress()
      // TODO: add loading indicators or we can `@tanstack/react-query` lib for
      // handling requests.
      setStakeFlow(initializedStakeFlow)
      setBtcAddress(btcDepositAddress)
    },
    [isInitialized, acre],
  )

  const signMessage = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")

    await stakeFlow.signMessage()
  }, [stakeFlow])

  const stake = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")

    await stakeFlow.stake()
  }, [stakeFlow])

  const context = useMemo(
    () => ({
      initStake,
      btcAddress,
      signMessage,
      stake,
    }),
    [btcAddress, initStake, signMessage, stake],
  )

  return (
    <StakeFlowContext.Provider value={context}>
      {children}
    </StakeFlowContext.Provider>
  )
}
