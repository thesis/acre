import React, { useCallback } from "react"
import {
  useActionFlowPause,
  useActionFlowTokenAmount,
  useAppDispatch,
  useConnector,
  useInvalidateQueries,
  useStakeFlowContext,
  useVerifyDepositAddress,
  useWallet,
} from "#/hooks"
import { eip1193, logPromiseFailure } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import { setStatus, setTxHash } from "#/store/action-flow"
import { ONE_SEC_IN_MILLISECONDS, queryKeysFactory } from "#/constants"
import { useTimeout } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import WalletInteractionModal from "../WalletInteractionModal"

const { userKeys } = queryKeysFactory

export default function DepositBTCModal() {
  const connector = useConnector()
  const { address } = useWallet()
  const tokenAmount = useActionFlowTokenAmount()
  const { btcAddress, depositReceipt, stake } = useStakeFlowContext()
  const verifyDepositAddress = useVerifyDepositAddress()
  const dispatch = useAppDispatch()
  const { handlePause } = useActionFlowPause()
  const handleBitcoinBalanceInvalidation = useInvalidateQueries({
    queryKey: userKeys.balance(),
  })

  const onStakeBTCSuccess = useCallback(() => {
    handleBitcoinBalanceInvalidation()
    dispatch(setStatus(PROCESS_STATUSES.SUCCEEDED))
  }, [dispatch, handleBitcoinBalanceInvalidation])

  const onError = useCallback(
    () => dispatch(setStatus(PROCESS_STATUSES.FAILED)),
    [dispatch],
  )

  const { mutate: handleStake } = useMutation({
    mutationKey: ["stake"],
    mutationFn: stake,
    onSuccess: onStakeBTCSuccess,
    onError,
  })

  const onDepositBTCSuccess = useCallback(
    (transactionHash: string) => {
      dispatch(setTxHash(transactionHash))
      handleStake()
    },
    [dispatch, handleStake],
  )

  const onDepositBTCError = useCallback(
    (error: unknown) => {
      if (eip1193.didUserRejectRequest(error)) {
        handlePause()
      } else {
        onError()
        console.error(error)
      }
    },
    [onError, handlePause],
  )

  const { mutate: sendBitcoinTransaction, status } = useMutation({
    mutationKey: ["send-bitcoin"],
    mutationFn: async ({
      recipient,
      amount,
    }: {
      recipient: string
      amount: bigint
    }) => {
      if (!address) {
        throw new Error("Bitcoin account was not connected.")
      }

      if (!connector) {
        throw new Error("Connector was not defined.")
      }
      // @ts-expect-error adjust types to handle bitcoin wallet wrappers
      const client = await connector.getClient()

      const satoshis = Number(amount)

      // @ts-expect-error adjust types to handle bitcoin wallet wrappers
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      const txhash: string = await client.sendBitcoin(recipient, satoshis)
      return txhash
    },
    onSuccess: onDepositBTCSuccess,
    onError: onDepositBTCError,
  })

  const handledDepositBTC = useCallback(async () => {
    if (!tokenAmount?.amount || !btcAddress || !depositReceipt) return
    const verificationStatus = await verifyDepositAddress(
      depositReceipt,
      btcAddress,
    )

    if (verificationStatus === "valid") {
      sendBitcoinTransaction({
        recipient: btcAddress,
        amount: tokenAmount?.amount,
      })
    } else {
      onError()
    }
  }, [
    tokenAmount?.amount,
    btcAddress,
    depositReceipt,
    verifyDepositAddress,
    sendBitcoinTransaction,
    onError,
  ])

  const handledDepositBTCWrapper = useCallback(() => {
    logPromiseFailure(handledDepositBTC())
  }, [handledDepositBTC])

  useTimeout(handledDepositBTCWrapper, ONE_SEC_IN_MILLISECONDS)

  if (status === "pending" || status === "success")
    return <WalletInteractionModal step="awaiting-transaction" />

  return <WalletInteractionModal step="opening-wallet" />
}
