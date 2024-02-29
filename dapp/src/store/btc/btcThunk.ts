import { createAsyncThunk } from "@reduxjs/toolkit"
import { fetchCryptoCurrencyPriceUSD } from "#/utils/exchangeApi"

export const fetchBTCPriceUSD = createAsyncThunk(
  "btc/fetchBTCPriceUSD",
  async () => {
    try {
      const priceUSD: number = await fetchCryptoCurrencyPriceUSD("bitcoin")
      return priceUSD
    } catch (error) {
      console.error(error)
      return undefined
    }
  },
)
