import { useCallback, useMemo } from "react"
import { Connector, useAccount, useChainId, useConnect } from "wagmi"
import { Account } from "@ledgerhq/wallet-api-client"
import { useWalletContext } from "./useWalletContext"
import { useRequestBitcoinAccount } from "./useRequestBitcoinAccount"

type UseWalletReturn = {
  isConnected: boolean
  onConnect: (connector: Connector) => void
  bitcoin: {
    account: Account | undefined
    requestAccount: () => Promise<void>
  }
}

export function useWallet(): UseWalletReturn {
  const { btcAccount } = useWalletContext()
  const { requestAccount: requestBitcoinAccount } = useRequestBitcoinAccount()

  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { connect } = useConnect()

  const onConnect = useCallback(
    (connector: Connector) => {
      connect({ connector, chainId })
    },
    [connect, chainId],
  )

  return useMemo(
    () => ({
      isConnected,
      onConnect,
      bitcoin: {
        account: btcAccount,
        requestAccount: async () => {
          await requestBitcoinAccount()
        },
      },
    }),
    [btcAccount, isConnected, onConnect, requestBitcoinAccount],
  )
}
