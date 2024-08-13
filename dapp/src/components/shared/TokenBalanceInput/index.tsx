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
  bigIntToUserAmount,
  getCurrencyByType,
  getTokenAmountErrorKey,
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
  ...inputProps
}: TokenBalanceInputProps) {
  const valueRef = useRef<bigint | undefined>(amount)
  const styles = useMultiStyleConfig("TokenBalanceInput", { size })

  const { decimals, desiredDecimals } = getCurrencyByType(currency)

  const handleValueChange = (value: string) => {
    valueRef.current = value ? userAmountToBigInt(value, decimals) : undefined
  }

  const isBalanceExceeded =
    typeof errorMsgText === "string" &&
    getTokenAmountErrorKey(errorMsgText) === "EXCEEDED_VALUE"

  return (
    <FormControl isInvalid={hasError} isDisabled={inputProps.isDisabled}>
      <FormLabel htmlFor={inputProps.name} size={size} mr={0}>
        <Box __css={styles.labelContainer}>
          Amount
          <Box __css={styles.balanceContainer}>
            <Box as="span" __css={styles.balance}>
              Wallet balance
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
          placeholder={placeholder}
          {...inputProps}
          value={
            amount
              ? bigIntToUserAmount(amount, decimals, desiredDecimals)
              : undefined
          }
          onValueChange={(values: NumberFormatInputValues) =>
            handleValueChange(values.value)
          }
          onChange={() => {
            setAmount(valueRef?.current)
          }}
          decimalScale={decimals}
          allowNegative={false}
        />

        {withMaxButton && (
          <InputRightElement>
            <Button h="70%" onClick={() => setAmount(tokenBalance)}>
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
