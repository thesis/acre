import { useCallback, useEffect, useMemo, useState } from "react"
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi"
import { logPromiseFailure, orangeKit } from "#/utils"
import {
  OnErrorCallback,
  OrangeKitConnector,
  OrangeKitError,
  Status,
} from "#/types"
import { useConnector } from "./orangeKit/useConnector"
import { useBitcoinProvider } from "./orangeKit/useBitcoinProvider"
import useBitcoinBalance from "./orangeKit/useBitcoinBalance"
import useResetWalletState from "./useResetWalletState"

const { typeConversionToConnector, typeConversionToOrangeKitConnector } =
  orangeKit

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  ethAddress?: string
  balance?: bigint
  status: Status
  onConnect: (
    connector: OrangeKitConnector,
    options?: {
      onSuccess?: (connector: OrangeKitConnector) => void
      onError?: OnErrorCallback<OrangeKitError>
    },
  ) => void
  onDisconnect: () => void
}

export function useWallet(): UseWalletReturn {
  const chainId = useChainId()
  const { status: accountStatus } = useAccount()
  const { connect, status } = useConnect()
  const { disconnect } = useDisconnect()
  const connector = useConnector()
  const provider = useBitcoinProvider()
  const { data: balance } = useBitcoinBalance()
  const resetWalletState = useResetWalletState()

  const [address, setAddress] = useState<string | undefined>(undefined)
  const [ethAddress, setEthAddress] = useState<string | undefined>(undefined)

  // `isConnected` is variable derived from `status` but does not guarantee us a set `address`.
  // When `status` is 'connected' properties like `address` are guaranteed to be defined.
  // Let's use `status` to make sure the account is connected.
  const isConnected = useMemo(
    () => orangeKit.isConnectedStatus(accountStatus),
    [accountStatus],
  )

  const onConnect = useCallback(
    (
      selectedConnector: OrangeKitConnector,
      options?: {
        onSuccess?: (connector: OrangeKitConnector) => void
        onError?: OnErrorCallback<OrangeKitError>
      },
    ) => {
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
    [connect, chainId],
  )

  const onDisconnect = useCallback(() => {
    disconnect(
      {},
      {
        onSuccess: () => {
          resetWalletState()
        },
      },
    )
  }, [disconnect, resetWalletState])

  useEffect(() => {
    const fetchBitcoinAddress = async () => {
      if (connector) {
        const btcAddress = await connector.getBitcoinAddress()
        const accounts = await connector.getAccounts()

        setAddress(btcAddress)
        setEthAddress(accounts[0])
      } else {
        setAddress(undefined)
        setEthAddress(undefined)
      }
    }

    logPromiseFailure(fetchBitcoinAddress())
  }, [connector, provider])

  return useMemo(
    () => ({
      isConnected,
      address,
      ethAddress,
      balance,
      status,
      onConnect,
      onDisconnect,
    }),
    [
      address,
      balance,
      ethAddress,
      isConnected,
      onConnect,
      onDisconnect,
      status,
    ],
  )
}
