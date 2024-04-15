import { useCallback, useState } from "react"
import {
  StakeInitialization,
  EthereumAddress,
  DepositorProxy,
  DepositReceipt,
  SaveRevealRequest,
} from "@acre-btc/sdk"
import { useAcreContext } from "./useAcreContext"

export type UseStakeFlowReturn = {
  initStake: (
    bitcoinRecoveryAddress: string,
    ethereumAddress: string,
    referral: number,
    depositor?: DepositorProxy,
  ) => Promise<void>
  btcAddress?: string
  depositReceipt?: DepositReceipt
  signMessage: () => Promise<void>
  stake: () => Promise<void>
  saveReveal: () => Promise<boolean>
}

export function useStakeFlow(): UseStakeFlowReturn {
  const { acre, isInitialized } = useAcreContext()

  const [stakeFlow, setStakeFlow] = useState<StakeInitialization | undefined>(
    undefined,
  )
  const [depositOwner, setDepositOwner] = useState<string | undefined>(
    undefined,
  )
  const [btcAddress, setBtcAddress] = useState<string | undefined>(undefined)
  const [depositReceipt, setDepositReceipt] = useState<
    DepositReceipt | undefined
  >(undefined)
  const [referral, setReferral] = useState<number | undefined>(undefined)

  const initStake = useCallback(
    async (
      bitcoinRecoveryAddress: string,
      ethereumAddress: string,
      referralValue: number,
      depositor?: DepositorProxy,
    ) => {
      if (!acre || !isInitialized) throw new Error("Acre SDK not defined")

      const initializedStakeFlow = await acre.staking.initializeStake(
        bitcoinRecoveryAddress,
        EthereumAddress.from(ethereumAddress),
        referralValue,
        depositor,
      )

      const btcDepositAddress = await initializedStakeFlow.getBitcoinAddress()
      const btcDepositReceipt = initializedStakeFlow.getDepositReceipt()

      // TODO: add loading indicators or we can `@tanstack/react-query` lib for
      // handling requests.
      setStakeFlow(initializedStakeFlow)
      setDepositOwner(bitcoinRecoveryAddress)
      setReferral(referralValue)
      setBtcAddress(btcDepositAddress)
      setDepositReceipt(btcDepositReceipt)
    },
    [isInitialized, acre],
  )

  const signMessage = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")

    await stakeFlow.signMessage()
  }, [stakeFlow])

  const stake = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")
    // The current waiting time for repeat transactions is very long.
    // TODO: Find the right value and pass it as additional options.
    await stakeFlow.stake()
  }, [stakeFlow])

  const saveReveal = useCallback(async () => {
    if (!stakeFlow) throw new Error("Initialize stake first")

    if (!depositReceipt || !referral || !depositOwner) return false

    const revealData: SaveRevealRequest = {
      address: depositOwner,
      revealInfo: depositReceipt,
      metadata: {
        depositOwner,
        referral,
      },
      application: "acre",
    }

    const response = await stakeFlow.saveReveal(revealData)
    return response
  }, [depositOwner, depositReceipt, referral, stakeFlow])

  return {
    initStake,
    btcAddress,
    depositReceipt,
    signMessage,
    stake,
    saveReveal,
  }
}
