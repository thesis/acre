import React, { useMemo } from "react"
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Icon,
  InputGroup,
  InputProps,
  InputRightElement,
  useMultiStyleConfig,
} from "@chakra-ui/react"
import { fixedPointNumberToString } from "../../../utils"
import { CurrencyType } from "../../../types"
import { CURRENCIES_BY_TYPE } from "../../../constants"
import NumberFormatInput, {
  NumberFormatInputValues,
} from "../NumberFormatInput"
import { CurrencyBalance } from "../CurrencyBalance"
import { AlertInfo } from "../../../static/icons"

const VARIANT = "balance"

type HelperErrorTextProps = {
  errorMsgText?: string | JSX.Element
  hasError?: boolean
  helperText?: string | JSX.Element
}

function HelperErrorText({
  helperText,
  errorMsgText,
  hasError,
}: HelperErrorTextProps) {
  if (hasError) {
    return (
      <FormErrorMessage>
        {errorMsgText || "Please enter a valid value"}
      </FormErrorMessage>
    )
  }

  if (helperText) {
    return (
      <FormHelperText>
        <Icon as={AlertInfo} />
        {helperText}
      </FormHelperText>
    )
  }

  return null
}

type FiatCurrencyBalanceProps = {
  fiatAmount?: string
  fiatCurrencyType?: CurrencyType
}

function FiatCurrencyBalance({
  fiatAmount,
  fiatCurrencyType,
}: FiatCurrencyBalanceProps) {
  const styles = useMultiStyleConfig("Form")
  const { fontWeight } = styles.helperText

  if (fiatAmount && fiatCurrencyType) {
    return (
      <CurrencyBalance
        currencyType={fiatCurrencyType}
        amount={fiatAmount}
        shouldBeFormatted={false}
        fontWeight={fontWeight as string}
        size="sm"
      />
    )
  }

  return null
}

type TokenBalanceInputProps = {
  amount?: string
  currencyType: CurrencyType
  tokenBalance: string | number
  placeholder?: string
  size?: "lg" | "md"
  setAmount: (value: string) => void
} & InputProps &
  HelperErrorTextProps &
  FiatCurrencyBalanceProps

export default function TokenBalanceInput({
  amount,
  currencyType,
  tokenBalance,
  placeholder,
  size = "lg",
  setAmount,
  errorMsgText,
  helperText,
  hasError = false,
  fiatAmount,
  fiatCurrencyType,
  ...inputProps
}: TokenBalanceInputProps) {
  const styles = useMultiStyleConfig("TokenBalanceInput", { size })

  const tokenBalanceAmount = useMemo(
    () =>
      fixedPointNumberToString(
        BigInt(tokenBalance || 0),
        CURRENCIES_BY_TYPE[currencyType].decimals,
      ),
    [currencyType, tokenBalance],
  )

  return (
    <FormControl isInvalid={hasError} isDisabled={inputProps.isDisabled}>
      <FormLabel htmlFor={inputProps.name} size={size}>
        <Box __css={styles.labelContainer}>
          Amount
          <Box __css={styles.balanceContainer}>
            <Box as="span" __css={styles.balance}>
              Balance
            </Box>
            <CurrencyBalance
              size={size === "lg" ? "md" : "sm"}
              amount={tokenBalance}
              currencyType={currencyType}
            />
          </Box>
        </Box>
      </FormLabel>
      <InputGroup variant={VARIANT}>
        <NumberFormatInput
          size={size}
          value={amount}
          variant={VARIANT}
          isInvalid={hasError}
          placeholder={placeholder}
          onValueChange={(values: NumberFormatInputValues) =>
            setAmount(values.value)
          }
          {...inputProps}
        />
        <InputRightElement>
          <Button h="70%" onClick={() => setAmount(tokenBalanceAmount)}>
            Max
          </Button>
        </InputRightElement>
      </InputGroup>
      <HelperErrorText
        helperText={helperText}
        errorMsgText={errorMsgText}
        hasError={hasError}
      />
      {!hasError && !helperText && (
        <FormHelperText>
          <FiatCurrencyBalance
            fiatAmount={fiatAmount}
            fiatCurrencyType={fiatCurrencyType}
          />
        </FormHelperText>
      )}
    </FormControl>
  )
}
