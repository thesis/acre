import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi"
import { logPromiseFailure, orangeKit } from "#/utils"
import { OnErrorCallback, OnSuccessCallback, STATUSES, Status } from "#/types"
import { useBitcoinProvider, useConnector } from "./orangeKit"

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  balance: bigint
  status: Status
  onConnect: (
    connector: Connector,
    options?: { onSuccess?: OnSuccessCallback; onError?: OnErrorCallback },
  ) => void
  onDisconnect: () => void
}

export function useWallet(): UseWalletReturn {
  const chainId = useChainId()
  const { status: accountStatus } = useAccount()
  const { connect, status: connectStatus } = useConnect()
  const { disconnect } = useDisconnect()
  const connector = useConnector()
  const provider = useBitcoinProvider()

  const [address, setAddress] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState<bigint>(0n)
  const [status, setStatus] = useState<Status>(STATUSES.IDLE)

  // `isConnected` is variable derived from `status` but does not guarantee us a set `address`.
  // When `status` is 'connected' properties like `address` are guaranteed to be defined.
  // Let's use `status` to make sure the account is connected.
  const isConnected = useMemo(
    () => orangeKit.isConnectedStatus(accountStatus),
    [accountStatus],
  )

  const onConnect = useCallback(
    (
      selectedConnector: Connector,
      options?: { onSuccess?: OnSuccessCallback; onError?: OnErrorCallback },
    ) => {
      setStatus(STATUSES.PENDING)
      connect({ connector: selectedConnector, chainId }, { ...options })
    },
    [connect, chainId],
  )

  const onDisconnect = useCallback(() => {
    disconnect()
    // TODO: Reset redux state
    setStatus(STATUSES.IDLE)
  }, [disconnect])

  useEffect(() => {
    const fetchBalance = async () => {
      if (provider) {
        const { total } = await provider.getBalance()

        setBalance(BigInt(total))
      } else {
        setBalance(0n)
      }
    }

    const fetchBitcoinAddress = async () => {
      if (connector) {
        const btcAddress = await connector.getBitcoinAddress()

        setAddress(btcAddress)
      } else {
        setAddress(undefined)
      }
    }

    logPromiseFailure(fetchBalance())
    logPromiseFailure(fetchBitcoinAddress())
  }, [connector, provider])

  useEffect(() => {
    if (connectStatus === "error") setStatus(STATUSES.ERROR)
    if (connectStatus === "success") setStatus(STATUSES.SUCCESS)
  }, [connectStatus])

  return useMemo(
    () => ({
      isConnected,
      address,
      balance,
      status,
      onConnect,
      onDisconnect,
    }),
    [address, balance, isConnected, onConnect, onDisconnect, status],
  )
}
