import React, { useRef } from "react"
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
import {
  fixedPointNumberToString,
  getCurrencyByType,
  userAmountToBigInt,
} from "#/utils"
import { CurrencyType } from "#/types"
import { IconInfoCircle } from "@tabler/icons-react"
import { useCurrencyConversion } from "#/hooks"
import NumberFormatInput, {
  NumberFormatInputValues,
} from "../NumberFormatInput"
import { CurrencyBalance } from "../CurrencyBalance"

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
        <Icon as={IconInfoCircle} />
        {helperText}
      </FormHelperText>
    )
  }

  return null
}

type FiatCurrencyBalanceProps = {
  amount: bigint
  currency: CurrencyType
  fiatCurrency: CurrencyType
}

function FiatCurrencyBalance({
  amount,
  currency,
  fiatCurrency,
}: FiatCurrencyBalanceProps) {
  const styles = useMultiStyleConfig("Form")
  const { fontWeight } = styles.helperText

  const fiatAmount = useCurrencyConversion({
    from: { amount, currency },
    to: { currency: fiatCurrency },
  })

  if (fiatAmount !== undefined) {
    return (
      <CurrencyBalance
        currency={fiatCurrency}
        amount={fiatAmount}
        shouldBeFormatted={false}
        fontWeight={fontWeight as string}
        size="sm"
      />
    )
  }

  return null
}

export type TokenBalanceInputProps = {
  amount?: bigint
  currency: CurrencyType
  tokenBalance: bigint
  placeholder?: string
  size?: "lg" | "md"
  fiatCurrency?: CurrencyType
  setAmount: (value?: bigint) => void
} & InputProps &
  HelperErrorTextProps

export default function TokenBalanceInput({
  amount,
  currency,
  tokenBalance,
  placeholder,
  size = "lg",
  setAmount,
  errorMsgText,
  helperText,
  hasError = false,
  fiatCurrency,
  ...inputProps
}: TokenBalanceInputProps) {
  const valueRef = useRef<bigint | undefined>(amount)
  const styles = useMultiStyleConfig("TokenBalanceInput", { size })

  const { decimals } = getCurrencyByType(currency)

  const handleValueChange = (value: string) => {
    valueRef.current = value ? userAmountToBigInt(value, decimals) : undefined
  }

  const showConversionBalance = amount !== undefined && !!fiatCurrency

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
              currency={currency}
            />
          </Box>
        </Box>
      </FormLabel>
      <InputGroup variant={VARIANT}>
        <NumberFormatInput
          size={size}
          variant={VARIANT}
          isInvalid={hasError}
          placeholder={placeholder}
          {...inputProps}
          value={
            amount ? fixedPointNumberToString(amount, decimals) : undefined
          }
          onValueChange={(values: NumberFormatInputValues) =>
            handleValueChange(values.value)
          }
          onChange={() => {
            setAmount(valueRef?.current)
          }}
        />
        <InputRightElement>
          <Button h="70%" onClick={() => setAmount(tokenBalance)}>
            Max
          </Button>
        </InputRightElement>
      </InputGroup>
      <HelperErrorText
        helperText={helperText}
        errorMsgText={errorMsgText}
        hasError={hasError}
      />
      {!hasError && !helperText && showConversionBalance && (
        <FormHelperText>
          <FiatCurrencyBalance
            amount={amount}
            currency={currency}
            fiatCurrency={fiatCurrency}
          />
        </FormHelperText>
      )}
    </FormControl>
  )
}
