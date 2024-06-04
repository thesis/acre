import { useCallback } from "react"
import { DepositReceipt } from "@acre-btc/sdk"
import { verifyDepositAddress } from "#/utils"
import { BITCOIN_NETWORK } from "#/constants"

export function useVerifyDepositAddress() {
  return useCallback(
    async (deposit: DepositReceipt, depositAddress: string) => {
      const { status } = await verifyDepositAddress(
        deposit,
        depositAddress,
        BITCOIN_NETWORK,
      )

      return status
    },
    [],
  )
}
