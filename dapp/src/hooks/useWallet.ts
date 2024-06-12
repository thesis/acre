import { useCallback, useEffect, useMemo, useState } from "react"
import { Connector, useAccount, useChainId, useConnect } from "wagmi"
import { logPromiseFailure } from "#/utils"
import { useOrangeKitConnector } from "./useOrangeKitConnector"

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  balance: bigint
  onConnect: (connector: Connector) => void
}

export function useWallet(): UseWalletReturn {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  const accountConnector = useOrangeKitConnector()

  const [address, setAddress] = useState<string | undefined>(undefined)
  // TODO: Temporary solution - Fetch BTC balance
  const [balance] = useState<bigint>(0n)

  const onConnect = useCallback(
    (connector: Connector) => {
      connect({ connector, chainId })
    },
    [connect, chainId],
  )

  useEffect(() => {
    const fetchBitcoinAddress = async () => {
      if (accountConnector) {
        const btcAddress = await accountConnector.getBitcoinAddress()

        setAddress(btcAddress)
      } else {
        setAddress(undefined)
      }
    }

    logPromiseFailure(fetchBitcoinAddress())
  }, [accountConnector])

  return useMemo(
    () => ({
      isConnected,
      address,
      balance,
      onConnect,
    }),
    [address, balance, isConnected, onConnect],
  )
}
