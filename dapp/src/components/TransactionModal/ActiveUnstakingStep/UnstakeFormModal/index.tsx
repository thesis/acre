import React from "react"
import { Card, CardBody, Flex, HStack } from "@chakra-ui/react"
import { BITCOIN_MIN_AMOUNT } from "#/constants"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { TextMd, TextSm } from "#/components/shared/Typography"
import Spinner from "#/components/shared/Spinner"
import { FormSubmitButton } from "#/components/shared/Form"
import UnstakeDetails from "./UnstakeDetails"

// TODO: Use a position amount
const MOCK_POSITION_AMOUNT = "2398567898"

function UnstakeFormModal({
  onSubmitForm,
}: {
  onSubmitForm: (values: TokenAmountFormValues) => void
}) {
  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      tokenBalance={MOCK_POSITION_AMOUNT}
      minTokenAmount={BITCOIN_MIN_AMOUNT}
      onSubmitForm={onSubmitForm}
    >
      <Flex flexDirection="column" gap={10}>
        <UnstakeDetails currency="bitcoin" />
        <Card textAlign="start">
          <CardBody py={4} px={5}>
            <HStack justifyContent="space-between">
              <TextMd fontWeight="bold">Next batch starts in...</TextMd>
              <Spinner />
            </HStack>
            <TextSm mt={4}>
              Extra informative text. Maximize your earnings by using tBTC to
              deposit and redeem BTC in DeFi!
            </TextSm>
          </CardBody>
        </Card>
      </Flex>
      <FormSubmitButton mt={6}>Unstake</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default UnstakeFormModal
