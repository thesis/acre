// export const toUsdBalance = (token: TokenState) => {
//     const amount = BigNumber.from(10)
//       .pow(18 - (token.decimals ?? 18)) // cast all to 18 decimals
//       .mul(BigNumber.from(token.balance))
//       .toString()
  
//     return getUsdBalance(amount, token.usdConversion)
//   }
// import { FixedNumber } from "@ethersproject/bignumber"

//   export const toUsdBalance = (
//     balance: string | number,
//     usdConversion: number
//   ): FixedNumber => {
//     return FixedNumber.fromString(usdConversion.toString()).mulUnsafe(
//       FixedNumber.fromString(balance.toString())
//     )
//   }


// import { BigNumber } from "ethers"

// const toUsdBalance = (token: TokenState) => {
//     const amount = BigNumber.from(10)
//       .pow(18 - (token.decimals ?? 18)) // cast all to 18 decimals
//       .mul(BigNumber.from(token.balance))
//       .toString()
  
//     return getUsdBalance(amount, token.usdConversion)
//   }

// import { FixedNumber } from "@ethersproject/bignumber"

// export const toUsdBalance = (
//     balance: string | number,
//     usdConversion: number
//   ): FixedNumber => {
//     return FixedNumber.fromString(usdConversion.toString()).mulUnsafe(
//       FixedNumber.fromString(balance.toString())
//     )
//   }

import { FixedNumber } from "@ethersproject/bignumber"
import { formatUnits } from "@ethersproject/units"
import numeral from "numeral"

export const formatNumeral = (number: string | number, format = "0,00.00") => {
    return numeral(number).format(format)
  }

export const formatFiatCurrencyAmount = (
    amount: number | string,
    format = "0,00",
    currencySymbol = "$"
  ) => {
    return formatNumeral(amount, `${currencySymbol}${format}`)
  }


export const toUsdBalance = (
    balance: string | number,
    usdConversion: number
  ): FixedNumber => {
    console.log('### balance', FixedNumber.fromString(usdConversion.toString()).mulUnsafe(
        FixedNumber.fromString(balance.toString())
      ))
    return FixedNumber.fromString(usdConversion.toString()).mulUnsafe(
      FixedNumber.fromString(balance.toString())
    ).floor()
  }


 export const getUsdBalance = (
    balance: string | number,
    usdConversion: number
  ): string => {
    console.log('### toUsdBalance(formatUnits(balance), usdConversion).toString()', toUsdBalance(formatUnits(balance), usdConversion).toString())
    return formatFiatCurrencyAmount(
      toUsdBalance(formatUnits(balance), usdConversion).toString()
    )
  }