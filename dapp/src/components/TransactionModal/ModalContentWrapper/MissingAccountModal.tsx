import React from "react"
import {
  Button,
  Highlight,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { logPromiseFailure, getCurrencyByType } from "#/utils"
import { CurrencyType, RequestAccountParams } from "#/types"
import { CardAlert } from "#/components/shared/alerts"

type MissingAccountModalProps = {
  currency: CurrencyType
  icon: typeof Icon
  requestAccount: (...params: RequestAccountParams) => Promise<void>
}

export default function MissingAccountModal({
  currency,
  icon,
  requestAccount,
}: MissingAccountModalProps) {
  const { name, symbol } = getCurrencyByType(currency)

  const handleClick = () => {
    logPromiseFailure(requestAccount())
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>{name} account not installed</ModalHeader>
      <ModalBody>
        <Icon as={icon} boxSize={32} my={2} />
        <TextMd>
          {name} account is required to make transactions for depositing and
          staking your {symbol}.
        </TextMd>
        <CardAlert>
          <TextMd>
            <Highlight query="Accounts" styles={{ fontWeight: "bold" }}>
              You will be sent to the Ledger Accounts section to perform this
              action.
            </Highlight>
          </TextMd>
        </CardAlert>
      </ModalBody>
      <ModalFooter mt={4}>
        <Button size="lg" width="100%" onClick={handleClick}>
          Connect account
        </Button>
      </ModalFooter>
    </>
  )
}
