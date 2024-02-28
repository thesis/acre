import React, { useCallback, useMemo } from "react"
import {
  UseStakeFlowReturn,
  useAcreContext,
  useStakeFlow,
} from "#/acre-react/hooks"
import { REFERRAL } from "#/constants"
import { RelayerDepositorProxy } from "#/web3"
import { EthereumTBTCDepositor } from "@acre-btc/sdk"

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
    stake,
  } = useStakeFlow()

  const initStake = useCallback(
    async (bitcoinRecoveryAddress: string, ethereumAddress: string) => {
      if (!acre) throw new Error("Acre SDK not defined")

      await acreInitStake(
        bitcoinRecoveryAddress,
        ethereumAddress,
        REFERRAL,
        RelayerDepositorProxy.fromEthereumTbtcDepositor(
          acre.contracts.tbtcDepositor as EthereumTBTCDepositor,
        ),
      )
    },
    [acreInitStake, acre],
  )

  const context = useMemo(
    () => ({
      initStake,
      signMessage,
      btcAddress,
      stake,
    }),
    [initStake, signMessage, btcAddress, stake],
  )

  return (
    <StakeFlowContext.Provider value={context}>
      {children}
    </StakeFlowContext.Provider>
  )
}
