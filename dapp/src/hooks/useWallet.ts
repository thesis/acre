import { useCallback, useEffect, useMemo, useState } from "react"
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi"
import { logPromiseFailure, orangeKit } from "#/utils"
import { OnErrorCallback, OrangeKitConnector, Status } from "#/types"
import { resetState } from "#/store/wallet"
import { useAppDispatch } from "./store"
import { useConnector } from "./orangeKit/useConnector"
import { useBitcoinProvider } from "./orangeKit/useBitcoinProvider"

const { typeConversionToConnector, typeConversionToOrangeKitConnector } =
  orangeKit

type UseWalletReturn = {
  isConnected: boolean
  address?: string
  balance: bigint
  status: Status
  onConnect: (
    connector: OrangeKitConnector,
    options?: {
      onSuccess?: (connector: OrangeKitConnector) => void
      onError?: OnErrorCallback
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
  const dispatch = useAppDispatch()

  const [address, setAddress] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState<bigint>(0n)

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
        onError?: OnErrorCallback
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
    disconnect()

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
