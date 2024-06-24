import { useCallback, useState } from "react"
import { StakeInitialization, DepositReceipt } from "@acre-btc/sdk"
import { useAcreContext } from "./useAcreContext"

export type UseStakeFlowReturn = {
  initStake: (
    referral: number,
    bitcoinRecoveryAddress?: string,
  ) => Promise<void>
  btcAddress?: string
  depositReceipt?: DepositReceipt
  stake: () => Promise<void>
}

export function useStakeFlow(): UseStakeFlowReturn {
  const { acre, isConnected } = useAcreContext()

  const [stakeFlow, setStakeFlow] = useState<StakeInitialization | undefined>(
    undefined,
  )
  const [btcAddress, setBtcAddress] = useState<string | undefined>(undefined)
  const [depositReceipt, setDepositReceipt] = useState<
    DepositReceipt | undefined
  >(undefined)

  const initStake = useCallback(
    async (referral: number, bitcoinRecoveryAddress?: string) => {
      if (!acre || !isConnected) throw new Error("Acre SDK not defined")

      const initializedStakeFlow = await acre.account.initializeStake(
        referral,
        bitcoinRecoveryAddress,
      )

      const btcDepositAddress = await initializedStakeFlow.getBitcoinAddress()
      const btcDepositReceipt = initializedStakeFlow.getDepositReceipt()

      // TODO: add loading indicators or we can `@tanstack/react-query` lib for
      // handling requests.
      setStakeFlow(initializedStakeFlow)
      setBtcAddress(btcDepositAddress)
      setDepositReceipt(btcDepositReceipt)
    },
    [isConnected, acre],
  )

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
    stake,
  }
}
