import React from "react"
import TokenAmountForm from "#/components/shared/TokenAmountForm"
import { TokenAmountFormValues } from "#/components/shared/TokenAmountForm/TokenAmountFormBase"
import { useMinDepositAmount, useWallet } from "#/hooks"
import { FormSubmitButton } from "#/components/shared/Form"
import { ACTION_FLOW_TYPES, BaseFormProps } from "#/types"
import { fixedPointNumberToString, getCurrencyByType } from "#/utils"
import { featureFlags } from "#/constants"
import { Box } from "@chakra-ui/react"
import StakeDetails from "./StakeDetails"
import AcrePointsRewardEstimation from "./AcrePointsRewardEstimation"

function StakeFormModal({
  onSubmitForm,
}: BaseFormProps<TokenAmountFormValues>) {
  const minDepositAmount = useMinDepositAmount()
  const { balance: tokenBalance } = useWallet()

  const { decimals } = getCurrencyByType("bitcoin")
  const inputPlaceholder = `Minimum ${fixedPointNumberToString(minDepositAmount, decimals)} BTC`
  const tokenAmountLabel = "Wallet balance"

  return (
    <TokenAmountForm
      actionType={ACTION_FLOW_TYPES.STAKE}
      tokenBalanceInputPlaceholder={inputPlaceholder}
      tokenAmountLabel={tokenAmountLabel}
      currency="bitcoin"
      tokenBalance={tokenBalance ?? 0n}
      minTokenAmount={minDepositAmount}
      onSubmitForm={onSubmitForm}
      withMaxButton={false}
    >
      {featureFlags.ACRE_POINTS_ENABLED && (
        <AcrePointsRewardEstimation mt={5} />
      )}

      <StakeDetails currency="bitcoin" />

      <Box
        pos="sticky"
        bottom={-10}
        m={-10}
        mt={10}
        p={10}
        pt={0}
        bg="gold.100"
      >
        <FormSubmitButton>Deposit</FormSubmitButton>
      </Box>
    </TokenAmountForm>
  )
}

export default StakeFormModal
