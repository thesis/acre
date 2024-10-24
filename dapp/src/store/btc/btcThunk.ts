import { createAsyncThunk } from "@reduxjs/toolkit"
import { acreApi } from "#/utils"

export const fetchBTCPriceUSD = createAsyncThunk(
  "btc/fetchBTCPriceUSD",
  async () => acreApi.getBtcUsdPrice(),
)
