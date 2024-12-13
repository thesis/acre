import { useCallback } from "react"
import { DepositReceipt } from "@acre-btc/sdk"
import { verifyDepositAddress } from "#/utils"
import { chains } from "#/constants"

export default function useVerifyDepositAddress() {
  return useCallback(
    async (deposit: DepositReceipt, depositAddress: string) => {
      const { status } = await verifyDepositAddress(
        deposit,
        depositAddress,
        chains.BITCOIN_NETWORK,
      )

      return status
    },
    [],
  )
}
