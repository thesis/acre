import React, { useCallback, useMemo } from "react"
import {
  UseStakeFlowReturn,
  useAcreContext,
  useStakeFlow,
} from "#/acre-react/hooks"
import { REFERRAL } from "#/constants"
import { RelayerDepositorProxy } from "#/web3"
import { EthereumBitcoinDepositor } from "@acre-btc/sdk"

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
  saveReveal: async () => Promise.resolve(false),
})

export function StakeFlowProvider({ children }: { children: React.ReactNode }) {
  const { acre } = useAcreContext()
  const {
    initStake: acreInitStake,
    signMessage,
    btcAddress,
    depositReceipt,
    stake,
    saveReveal,
  } = useStakeFlow()

  const initStake = useCallback(
    async (bitcoinRecoveryAddress: string, ethereumAddress: string) => {
      if (!acre) throw new Error("Acre SDK not defined")

      await acreInitStake(
        bitcoinRecoveryAddress,
        ethereumAddress,
        REFERRAL,
        RelayerDepositorProxy.fromEthereumBitcoinDepositor(
          acre.contracts.bitcoinDepositor as EthereumBitcoinDepositor,
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
      depositReceipt,
      stake,
      saveReveal,
    }),
    [initStake, signMessage, btcAddress, depositReceipt, stake, saveReveal],
  )

  return (
    <StakeFlowContext.Provider value={context}>
      {children}
    </StakeFlowContext.Provider>
  )
}
