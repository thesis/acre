import React from "react"
import {
  Button,
  Highlight,
  Icon,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@chakra-ui/react"
import { CurrencyType, RequestAccountParams } from "../../../types"
import { TextMd } from "../../shared/Typography"
import Alert from "../../shared/Alert"
import { CURRENCIES_BY_TYPE } from "../../../constants"

type MissingAccountProps = {
  currencyType: CurrencyType
  icon: typeof Icon
  requestAccount: (...params: RequestAccountParams) => Promise<void>
}

export default function MissingAccount({
  currencyType,
  icon,
  requestAccount,
}: MissingAccountProps) {
  const currency = CURRENCIES_BY_TYPE[currencyType]

  return (
    <>
      <ModalHeader>{currency.name} account not installed</ModalHeader>
      <ModalBody>
        <Icon as={icon} boxSize={32} my={2} />
        <TextMd>
          {currency.name} account is required to make transactions for
          depositing and staking your {currency.symbol}.
        </TextMd>
        <Alert status="info">
          <TextMd>
            <Highlight query="Accounts" styles={{ fontWeight: "bold" }}>
              You will be sent to the Ledger Accounts section to perform this
              action.
            </Highlight>
          </TextMd>
        </Alert>
      </ModalBody>
      <ModalFooter mt={4}>
        <Button
          size="lg"
          width="100%"
          onClick={async () => {
            await requestAccount()
          }}
        >
          Connect wallet
        </Button>
      </ModalFooter>
    </>
  )
}
