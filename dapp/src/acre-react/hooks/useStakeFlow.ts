import { useCallback, useState } from "react"
import { StakeInitialization, DepositReceipt } from "@acre-btc/sdk"
import { useAcreContext } from "./useAcreContext"

export type UseStakeFlowReturn = {
  initStake: (bitcoinAddress: string, referral: number) => Promise<void>
  btcAddress?: string
  depositReceipt?: DepositReceipt
  signMessage: () => Promise<void>
  stake: () => Promise<void>
}

export function useStakeFlow(): UseStakeFlowReturn {
  const { acre, isInitialized } = useAcreContext()

  const [stakeFlow, setStakeFlow] = useState<StakeInitialization | undefined>(
    undefined,
  )
  const [btcAddress, setBtcAddress] = useState<string | undefined>(undefined)
  const [depositReceipt, setDepositReceipt] = useState<
    DepositReceipt | undefined
  >(undefined)

  const initStake = useCallback(
    async (bitcoinAddress: string, referral: number) => {
      if (!acre || !isInitialized) throw new Error("Acre SDK not defined")

      const initializedStakeFlow = await acre.staking.initializeStake(
        bitcoinAddress,
        referral,
      )

      const btcDepositAddress = await initializedStakeFlow.getBitcoinAddress()
      const btcDepositReceipt = initializedStakeFlow.getDepositReceipt()

      // TODO: add loading indicators or we can `@tanstack/react-query` lib for
      // handling requests.
      setStakeFlow(initializedStakeFlow)
      setBtcAddress(btcDepositAddress)
      setDepositReceipt(btcDepositReceipt)
    },
    [isInitialized, acre],
  )

  const signMessage = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")

    await Promise.resolve(stakeFlow.signMessage())
  }, [stakeFlow])

  const stake = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")
    // The current waiting time for repeat transactions is very long.
    // TODO: Find the right value and pass it as additional options.
    await stakeFlow.stake()
  }, [stakeFlow])

  return {
    initStake,
    btcAddress,
    depositReceipt,
    signMessage,
    stake,
  }
}
