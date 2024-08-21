import React, { useRef, useState } from "react"
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
  isFormError,
  userAmountToBigInt,
} from "#/utils"
import { CurrencyType } from "#/types"
import { IconInfoCircle } from "@tabler/icons-react"
import { useCurrencyConversion } from "#/hooks"
import NumberFormatInput, {
  NumberFormatInputValues,
  NumberFormatInputProps,
} from "../NumberFormatInput"
import { CurrencyBalance } from "../CurrencyBalance"
import { Alert, AlertIcon, AlertDescription } from "../Alert"

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
        <Alert status="error">
          <AlertIcon status="error" />
          <AlertDescription>
            {errorMsgText || "Please enter a valid value"}
          </AlertDescription>
        </Alert>
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
  withMaxButton?: boolean
  tokenAmountLabel?: string
} & InputProps &
  HelperErrorTextProps &
  Pick<NumberFormatInputProps, "decimalScale">

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
  withMaxButton = false,
  tokenAmountLabel = "Amount",
  ...inputProps
}: TokenBalanceInputProps) {
  const valueRef = useRef<bigint | undefined>(amount)
  const [displayedValue, setDisplayedValue] = useState<string | undefined>()
  const styles = useMultiStyleConfig("TokenBalanceInput", { size })

  const { decimals, symbol } = getCurrencyByType(currency)

  const onValueChange = (values: NumberFormatInputValues) => {
    const { value } = values

    valueRef.current = value ? userAmountToBigInt(value, decimals) : undefined
    setDisplayedValue(value)
  }

  const onChange = () => {
    setAmount(valueRef.current)
  }

  const onClickMaxButton = () => {
    setAmount(tokenBalance)
    setDisplayedValue(fixedPointNumberToString(tokenBalance, decimals))
  }

  const isBalanceExceeded =
    typeof errorMsgText === "string" &&
    isFormError("EXCEEDED_VALUE", errorMsgText)

  return (
    <FormControl isInvalid={hasError} isDisabled={inputProps.isDisabled}>
      <FormLabel htmlFor={inputProps.name} size={size} mr={0}>
        <Box __css={styles.labelContainer}>
          Amount
          <Box __css={styles.balanceContainer}>
            <Box as="span" __css={styles.balance}>
              {tokenAmountLabel}
            </Box>
            <CurrencyBalance
              color={isBalanceExceeded ? "red.400" : "gray.700"}
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
          suffix={` ${symbol}`}
          placeholder={placeholder}
          integerScale={10}
          decimalScale={decimals}
          allowNegative={false}
          {...inputProps}
          value={displayedValue}
          onValueChange={onValueChange}
          onChange={onChange}
        />

        {withMaxButton && (
          <InputRightElement>
            <Button h="70%" onClick={onClickMaxButton}>
              Max
            </Button>
          </InputRightElement>
        )}
      </InputGroup>
      <HelperErrorText
        helperText={helperText}
        errorMsgText={errorMsgText}
        hasError={hasError}
      />
      {!hasError && !helperText && !!fiatCurrency && (
        <FormHelperText>
          <FiatCurrencyBalance
            amount={amount ?? 0n}
            currency={currency}
            fiatCurrency={fiatCurrency}
          />
        </FormHelperText>
      )}
    </FormControl>
  )
}
