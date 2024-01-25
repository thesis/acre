import { useCallback, useState } from "react"
import { StakeInitialization } from "sdk/dist/src/modules/staking/stake-initialization"
import { EthereumAddress } from "sdk/dist/src/lib/ethereum"
import { useAcreContext } from "../AcreSdkContext"

// TODO: Hardcode referral value.
const referral = 123

export function useStakeFlow() {
  const { acre, isInitialized } = useAcreContext()

  const [stakeFlow, setStakeFlow] = useState<StakeInitialization | undefined>(
    undefined,
  )
  const [btcAddress, setBtcAddress] = useState<string | undefined>(undefined)

  const initStake = useCallback(
    async (bitcoinRecoveryAddress: string, ethereumAddress: string) => {
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

  return {
    initStake,
    btcAddress,
    signMessage,
    stake,
  }
}
