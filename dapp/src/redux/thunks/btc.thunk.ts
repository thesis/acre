import { BITCOIN } from "#/constants";
import { fetchCryptoCurrencyPriceUSD } from "#/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBTCPriceUSD = createAsyncThunk(
    "btc/fetchBTCPriceUSD",
    async () => await fetchCryptoCurrencyPriceUSD(BITCOIN)
  )
