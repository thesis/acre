import { createAsyncThunk } from "@reduxjs/toolkit"
import { fetchCryptoCurrencyPriceUSD } from "#/utils"

export const fetchBTCPriceUSD = createAsyncThunk(
  "btc/fetchBTCPriceUSD",
  async () => fetchCryptoCurrencyPriceUSD("bitcoin"),
)
