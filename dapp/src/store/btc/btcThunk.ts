import { createAsyncThunk } from "@reduxjs/toolkit"
import { fetchCryptoCurrencyPriceUSD } from "#/utils/exchangeApi"
import sentry from "#/sentry"

export const fetchBTCPriceUSD = createAsyncThunk(
  "btc/fetchBTCPriceUSD",
  async () => {
    try {
      const priceUSD = await fetchCryptoCurrencyPriceUSD("bitcoin")
      return priceUSD
    } catch (error) {
      sentry.captureException(error)
      console.error(error)
      return 0
    }
  },
)
