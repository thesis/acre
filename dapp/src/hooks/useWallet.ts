import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Connector,
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
} from "wagmi"
import { logPromiseFailure, orangeKit } from "#/utils"
import { OnErrorCallback, Status } from "#/types"
import { resetState } from "#/store/wallet"
import { useBitcoinProvider, useConnector } from "./orangeKit"
import { useAppDispatch } from "./store"

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  balance: bigint
  status: Status
  onConnect: (
    connector: Connector,
    options?: {
      onSuccess?: (connector: Connector) => void
      onError?: OnErrorCallback
    },
  ) => void
  onDisconnect: () => void
}

export function useWallet(): UseWalletReturn {
  const chainId = useChainId()
  const { status: accountStatus } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const connector = useConnector()
  const provider = useBitcoinProvider()
  const dispatch = useAppDispatch()

  const [address, setAddress] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState<bigint>(0n)
  const [status, setStatus] = useState<Status>("idle")

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
      options?: {
        onSuccess?: (connector: Connector) => void
        onError?: OnErrorCallback
      },
    ) => {
      setStatus("pending")
      connect(
        { connector: selectedConnector, chainId },
        {
          onError: (error) => {
            setStatus("error")
            if (options?.onError) options.onError(error)
          },
          onSuccess: (_, variables) => {
            setStatus("success")
            if (options?.onSuccess)
              options.onSuccess(variables.connector as Connector)
          },
        },
      )
    },
    [connect, chainId],
  )

  const onDisconnect = useCallback(() => {
    disconnect()

    setStatus("idle")
    dispatch(resetState())
  }, [disconnect, dispatch])

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
