import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi"
import { logPromiseFailure } from "#/utils"
import { OnSuccessCallback } from "#/types"
import { useConnector } from "./orangeKit"

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  balance: bigint
  onConnect: (connector: Connector, onSuccess?: OnSuccessCallback) => void
  onDisconnect: () => void
}

export function useWallet(): UseWalletReturn {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const connector = useConnector()

  const [address, setAddress] = useState<string | undefined>(undefined)
  // TODO: Temporary solution - Fetch BTC balance
  const [balance] = useState<bigint>(0n)

  const onConnect = useCallback(
    (selectedConnector: Connector, onSuccess?: OnSuccessCallback) => {
      connect({ connector: selectedConnector, chainId }, { onSuccess })
    },
    [connect, chainId],
  )

  const onDisconnect = useCallback(() => {
    disconnect()
    // TODO: Reset redux state
  }, [disconnect])

  useEffect(() => {
    const fetchBitcoinAddress = async () => {
      if (connector) {
        const btcAddress = await connector.getBitcoinAddress()

        setAddress(btcAddress)
      } else {
        setAddress(undefined)
      }
    }

    logPromiseFailure(fetchBitcoinAddress())
  }, [connector])

  return useMemo(
    () => ({
      isConnected,
      address,
      balance,
      onConnect,
      onDisconnect,
    }),
    [address, balance, isConnected, onConnect, onDisconnect],
  )
}
