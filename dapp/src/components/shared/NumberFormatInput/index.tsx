import React from "react"
import {
  NumberFormatValues,
  NumericFormat,
  NumericFormatProps,
} from "react-number-format"
import { InputProps, chakra, useMultiStyleConfig } from "@chakra-ui/react"

const ChakraNumericFormat = chakra(NumericFormat)

export type NumberFormatInputValues = {
  formattedValue: string
  value: string
  floatValue: number
}

export type NumberFormatInputProps = {
  onValueChange: (values: NumberFormatInputValues) => void
  maxIntegerLength?: number
  maxDecimalLength?: number
} & InputProps &
  Pick<NumericFormatProps, "decimalScale" | "allowNegative" | "suffix">

/**
 * Component is from the Threshold Network React Components repository.
 * It has been used because it supports the thousandth separator
 * and can be easily integrated with Chakra UI.
 *
 * More info:
 * https://github.com/threshold-network/components/blob/main/src/components/NumberFormatInput/index.tsx
 */
const NumberFormatInput = React.forwardRef<
  HTMLInputElement,
  NumberFormatInputProps
>((props, ref) => {
  const { field: css } = useMultiStyleConfig("Input", props)

  const {
    decimalScale,
    isDisabled,
    isInvalid,
    maxIntegerLength,
    maxDecimalLength,
    ...restProps
  } = props

  const handleLengthValidation = (values: NumberFormatValues) => {
    const { value } = values
    if (!value || !maxIntegerLength || !maxDecimalLength) return true

    const [integer, decimal] = value.split(".")
    const isValidIntegerLength = integer && integer.length <= maxIntegerLength
    const isValidDecimalLength = decimal && decimal.length <= maxDecimalLength

    return decimal ? isValidDecimalLength : isValidIntegerLength
  }

  return (
    <ChakraNumericFormat
      thousandSeparator
      decimalScale={decimalScale}
      __css={css}
      disabled={isDisabled}
      aria-invalid={isInvalid}
      getInputRef={ref}
      isAllowed={handleLengthValidation}
      {...restProps}
    />
  )
})

export default NumberFormatInput
