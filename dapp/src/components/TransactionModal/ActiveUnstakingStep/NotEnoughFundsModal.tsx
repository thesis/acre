import React from "react"
import { useAppDispatch, useMinWithdrawAmount } from "#/hooks"
import {
  AlertDescription,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  VStack,
} from "@chakra-ui/react"
import { setStatus } from "#/store/action-flow"
import { PROCESS_STATUSES } from "#/types"
import { BitcoinsStackErrorIcon } from "#/assets/icons"
import { TextMd, TextXl } from "../../shared/Typography"
import { Alert, AlertIcon } from "../../shared/Alert"
import CurrencyBalance from "../../shared/CurrencyBalance"

export default function NotEnoughFundsModal() {
  const dispatch = useAppDispatch()
  const minWithdrawAmount = useMinWithdrawAmount()

  const handleWithdrawAll = () => {
    dispatch(setStatus(PROCESS_STATUSES.REFINE_AMOUNT))
  }
  const handleContinue = () => {
    dispatch(setStatus(PROCESS_STATUSES.PENDING))
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader
        as={TextXl}
        fontSize="xl"
        textAlign="center"
        color="red.400"
        fontWeight="bold"
      >
        Not enough funds left for future withdrawals
      </ModalHeader>
      <ModalBody>
        <BitcoinsStackErrorIcon />

        <TextMd color="grey.600" px={1}>
          After this withdrawal, your balance will fall below the{" "}
          <CurrencyBalance
            amount={minWithdrawAmount}
            currency="bitcoin"
            as="span"
          />{" "}
          minimum required to initiate a withdrawal. Subsequent withdrawals will
          not be possible until a new deposit is made.
        </TextMd>

        <Alert status="info" variant="elevated">
          <AlertIcon />
          <AlertDescription>
            Your current withdrawal won&apos;t be impacted; only future
            withdrawals are affected.
          </AlertDescription>
        </Alert>

        <VStack spacing={3} align="stretch" w="full">
          <Button size="lg" onClick={handleWithdrawAll}>
            Withdraw all funds
          </Button>
          <Button size="lg" variant="outline" onClick={handleContinue}>
            I understand and I want to continue
          </Button>
        </VStack>
      </ModalBody>
    </>
  )
}
