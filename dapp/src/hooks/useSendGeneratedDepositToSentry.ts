import { useEffect } from "react"
import { captureMessage } from "#/sdk/sentry"
import { useWalletContext } from "./useWalletContext"
import { useStakeFlowContext } from "./useStakeFlowContext"

export function useSendGeneratedDepositToSentry() {
  const { depositReceipt, btcAddress } = useStakeFlowContext()
  const { ethAccount } = useWalletContext()

  useEffect(() => {
    if (depositReceipt) {
      const {
        depositor,
        blindingFactor,
        walletPublicKeyHash,
        refundPublicKeyHash,
        refundLocktime,
        extraData,
      } = depositReceipt
      captureMessage(
        `Generated deposit [${btcAddress}]`,
        {
          depositor: depositor.identifierHex,
          blindingFactor: blindingFactor.toString(),
          walletPublicKeyHash: walletPublicKeyHash.toString(),
          refundPublicKeyHash: refundPublicKeyHash.toString(),
          refundLocktime: refundLocktime.toString(),
          extraData: extraData?.toString(),
        },
        {
          ethAddress: `${ethAccount?.address}`,
        },
      )
    }
  }, [btcAddress, depositReceipt, ethAccount])
}
