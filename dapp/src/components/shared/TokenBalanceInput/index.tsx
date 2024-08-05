import React, { forwardRef, useRef } from "react"
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
  userAmountToBigInt,
} from "#/utils"
import { CurrencyType } from "#/types"
import { IconInfoCircle } from "@tabler/icons-react"
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

export type TokenBalanceInputProps = {
  amount?: bigint
  currency: CurrencyType
  tokenBalance: bigint
  placeholder?: string
  size?: "lg" | "md"
  setAmount: (value?: bigint) => void
  withMaxButton?: boolean
} & InputProps &
  HelperErrorTextProps &
  Pick<NumberFormatInputProps, "decimalScale">

const TokenBalanceInput = forwardRef<HTMLInputElement, TokenBalanceInputProps>(
  (props, ref) => {
    const {
      amount,
      currency,
      tokenBalance,
      placeholder,
      size = "lg",
      setAmount,
      errorMsgText,
      helperText,
      hasError = false,
      withMaxButton = false,
      ...inputProps
    } = props

    const valueRef = useRef<bigint | undefined>(amount)
    const styles = useMultiStyleConfig("TokenBalanceInput", { size })

    const { decimals } = getCurrencyByType(currency)

    const handleValueChange = (value: string) => {
      valueRef.current = value ? userAmountToBigInt(value, decimals) : undefined
    }

    // This is workaround, we should pass error codes along with error messages
    const isBalanceExceeded =
      hasError && errorMsgText?.toString().includes("exceeds")

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
            ref={ref}
            value={amount ? bigIntToUserAmount(amount, decimals) : undefined}
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
      </FormControl>
    )
  },
)

export default TokenBalanceInput
