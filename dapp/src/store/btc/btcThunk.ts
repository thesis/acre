import { createAsyncThunk } from "@reduxjs/toolkit"
import { acreApi } from "#/utils"

// eslint-disable-next-line import/prefer-default-export
export const fetchBTCPriceUSD = createAsyncThunk(
  "btc/fetchBTCPriceUSD",
  async () => acreApi.getBtcUsdPrice(),
)
