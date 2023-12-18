import React, { useMemo } from "react"
import {
  Box,
  Button,
  HStack,
  Icon,
  InputGroup,
  InputProps,
  InputRightElement,
  TypographyProps,
  createStylesContext,
  useMultiStyleConfig,
} from "@chakra-ui/react"
import { fixedPointNumberToString } from "../../../utils"
import { CurrencyType } from "../../../types"
import { CURRENCIES_BY_TYPE } from "../../../constants"
import NumberFormatInput, {
  NumberFormatInputValues,
} from "../NumberFormatInput"
import { CurrencyBalance } from "../CurrencyBalance"
import { Alert } from "../../../static/icons"

const VARIANT = "balance"
const [StylesProvider, useStyles] = createStylesContext("TokenBalanceInput")

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
  const styles = useStyles()

  if (hasError) {
    return (
      <Box as="span" __css={styles.errorMsgText}>
        {errorMsgText || "Please enter a valid value"}
      </Box>
    )
  }

  if (helperText) {
    return (
      <HStack __css={styles.helperText}>
        <Icon as={Alert} />
        <Box as="span">{helperText}</Box>
      </HStack>
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
  const { helperText } = useStyles()
  const textProps = helperText as TypographyProps

  if (fiatAmount && fiatCurrencyType) {
    return (
      <CurrencyBalance
        currencyType={fiatCurrencyType}
        amount={fiatAmount}
        shouldBeFormatted={false}
        {...textProps}
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
    <Box __css={styles.container}>
      <Box __css={styles.labelContainer}>
        <Box as="span" __css={styles.label}>
          Amount
        </Box>
        <HStack>
          <Box as="span" __css={styles.balance}>
            Balance
          </Box>
          <CurrencyBalance
            size={size === "lg" ? "md" : "sm"}
            amount={tokenBalance}
            currencyType={currencyType}
          />
        </HStack>
      </Box>
      <InputGroup variant={VARIANT}>
        <NumberFormatInput
          size={size}
          value={amount}
          variant={VARIANT}
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
      <StylesProvider value={styles}>
        <HelperErrorText
          helperText={helperText}
          errorMsgText={errorMsgText}
          hasError={hasError}
        />
        {!hasError && !helperText && (
          <FiatCurrencyBalance
            fiatAmount={fiatAmount}
            fiatCurrencyType={fiatCurrencyType}
          />
        )}
      </StylesProvider>
    </Box>
  )
}
