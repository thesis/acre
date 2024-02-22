import { createAsyncThunk } from "@reduxjs/toolkit"
import { fetchCryptoCurrencyPriceUSD } from "#/utils"

export const fetchBTCPriceUSD = createAsyncThunk(
  "btc/fetchBTCPriceUSD",
  async (_, { rejectWithValue }) => {
    try {
      const priceUSD: number = await fetchCryptoCurrencyPriceUSD("bitcoin")
      return priceUSD
    } catch (err) {
      return rejectWithValue(err)
    }
  },
)
