import React from "react"
import { Flex, Highlight } from "@chakra-ui/react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { TextMd } from "#/components/shared/Typography"
import { FormSubmitButton } from "#/components/shared/Form"
import { BaseFormProps } from "#/types"
import { CardAlert } from "#/components/shared/alerts"
import { MINIMUM_WITHDRAW_AMOUNT } from "#/constants"
import { useEstimatedBTCBalance } from "#/hooks"
import { formatSatoshiAmount } from "#/utils"
import UnstakeDetails from "./UnstakeDetails"

function UnstakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const balance = useEstimatedBTCBalance()
  const minimumBalanceText = `${formatSatoshiAmount(
    MINIMUM_WITHDRAW_AMOUNT,
  )} BTC `

  return (
    <TokenAmountForm
      tokenBalanceInputPlaceholder="BTC"
      currency="bitcoin"
      fiatCurrency="usd"
      tokenBalance={balance}
      minTokenAmount={MINIMUM_WITHDRAW_AMOUNT}
      onSubmitForm={onSubmitForm}
    >
      <Flex flexDirection="column" gap={10} mt={4}>
        <CardAlert>
          <TextMd>
            <Highlight
              query={minimumBalanceText}
              styles={{ fontWeight: "bold" }}
            >
              {`A minimum balance of ${minimumBalanceText} is required to keep all rewards active.`}
            </Highlight>
          </TextMd>
        </CardAlert>
        <UnstakeDetails currency="bitcoin" />
      </Flex>
      <FormSubmitButton mt={10}>Withdraw</FormSubmitButton>
    </TokenAmountForm>
  )
}

export default UnstakeFormModal
