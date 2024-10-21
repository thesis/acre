import { useCallback, useEffect, useMemo, useState } from "react"
import {
  useAccount,
  useChainId,
  useConfig,
  useConnect,
  useDisconnect,
} from "wagmi"
import { logPromiseFailure, orangeKit } from "#/utils"
import {
  OnErrorCallback,
  OrangeKitConnector,
  OrangeKitError,
  Status,
} from "#/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useConnector } from "./orangeKit/useConnector"
import { useBitcoinProvider } from "./orangeKit/useBitcoinProvider"
import useBitcoinBalance from "./orangeKit/useBitcoinBalance"
import useResetWalletState from "./useResetWalletState"
import useLastUsedBtcAddress from "./useLastUsedBtcAddress"

const { typeConversionToConnector, typeConversionToOrangeKitConnector } =
  orangeKit

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  balance?: bigint
  status: Status
  onConnect: (
    connector: OrangeKitConnector,
    options?: {
      isReconnecting?: boolean
      onSuccess?: (connector: OrangeKitConnector) => void
      onError?: OnErrorCallback<OrangeKitError>
    },
  ) => void
  onDisconnect: () => void
}

export function useWallet(): UseWalletReturn {
  const chainId = useChainId()
  const config = useConfig()
  const { status: accountStatus, address: account } = useAccount()
  const { connect, status } = useConnect()
  const { disconnect } = useDisconnect()
  const connector = useConnector()
  const provider = useBitcoinProvider()
  const resetWalletState = useResetWalletState()
  const { setAddressInLocalStorage, removeAddressFromLocalStorage } =
    useLastUsedBtcAddress()

  const [address, setAddress] = useState<string | undefined>(undefined)
  const { data: balance } = useBitcoinBalance(address)

  // `isConnected` is variable derived from `status` but does not guarantee us a set `address`.
  // When `status` is 'connected' properties like `address` are guaranteed to be defined.
  // Let's use `status` to make sure the account is connected.
  const isConnected = useMemo(
    () => orangeKit.isConnectedStatus(accountStatus),
    [accountStatus],
  )

  const queryClient = useQueryClient()
  const { mutate: reconnect, status: reconnectStatus } = useMutation(
    {
      mutationFn: async (selectedConnector: OrangeKitConnector) => {
        if (!selectedConnector.connect) return
        const prevAddress = await selectedConnector.getBitcoinAddress()
        const {
          accounts: [newAccount],
        } = await selectedConnector.connect({ chainId, isReconnecting: true })
        const newAddress = await selectedConnector.getBitcoinAddress()

        if (newAddress !== prevAddress) {
          config.setState((prevState) => ({
            ...prevState,
            status: "connected",
            connections: new Map(prevState.connections).set(
              prevState.current!,
              {
                // Update accounts to force update of wagmi hooks.
                accounts: [newAccount],
                connector:
                  orangeKit.typeConversionToConnector(selectedConnector),
                chainId,
              },
            ),
          }))

          setAddress(newAddress)
          resetWalletState()
        }
      },
      mutationKey: ["reconnect"],
    },
    queryClient,
  )

  const onConnect = useCallback(
    (
      selectedConnector: OrangeKitConnector,
      options?: {
        onSuccess?: (connector: OrangeKitConnector) => void
        onError?: OnErrorCallback<OrangeKitError>
        isReconnecting?: boolean
      },
    ) => {
      if (options?.isReconnecting) {
        reconnect(selectedConnector, {
          onSuccess: (_, connectedConnector) =>
            options?.onSuccess?.(connectedConnector),
          onError: options.onError,
        })
        return
      }

      connect(
        { connector: typeConversionToConnector(selectedConnector), chainId },
        {
          onError: (error) => {
            if (options?.onError) options.onError(error)
          },
          onSuccess: (_, variables) => {
            if (
              options?.onSuccess &&
              typeof variables.connector !== "function"
            ) {
              options.onSuccess(
                typeConversionToOrangeKitConnector(variables.connector),
              )
            }
          },
        },
      )
    },
    [connect, chainId, reconnect],
  )

  const onDisconnect = useCallback(() => {
    disconnect()
    setAddress(undefined)
    resetWalletState()
    removeAddressFromLocalStorage()
  }, [disconnect, resetWalletState, removeAddressFromLocalStorage])

  useEffect(() => {
    const fetchBitcoinAddress = async () => {
      if (connector) {
        const btcAddress = await connector.getBitcoinAddress()
        setAddress(btcAddress)
        setAddressInLocalStorage(btcAddress)
      } else {
        setAddress(undefined)
      }
    }

    logPromiseFailure(fetchBitcoinAddress())
  }, [connector, setAddressInLocalStorage, provider, account])

  return useMemo(
    () => ({
      isConnected,
      address,
      balance,
      status:
        status === "idle" && reconnectStatus !== "idle"
          ? reconnectStatus
          : status,
      onConnect,
      onDisconnect,
    }),
    [
      address,
      balance,
      isConnected,
      onConnect,
      onDisconnect,
      status,
      reconnectStatus,
    ],
  )
}
