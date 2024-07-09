import React from "react"
import { useAppDispatch } from "#/hooks"
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
} from "@chakra-ui/react"
import { setStatus } from "#/store/action-flow"
import { PROCESS_STATUSES } from "#/types"

export default function NotEnoughFundsModal() {
  const dispatch = useAppDispatch()

  const handleWithdrawAll = () => {
    dispatch(setStatus(PROCESS_STATUSES.REFINE_AMOUNT))
  }
  const handleContinue = () => {
    dispatch(setStatus(PROCESS_STATUSES.PENDING))
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Not enough funds left for future withdrawals</ModalHeader>
      <ModalBody>
        After this withdrawal, your balance will fall below the 0.01 BTC minimum
        required to initiate a withdrawal. Subsequent withdrawals will not be
        possible until a new deposit is made.
        <Button onClick={handleWithdrawAll}>Withdraw all</Button>
        <Button variant="outline" onClick={handleContinue}>
          Continue
        </Button>
      </ModalBody>
    </>
  )
}
