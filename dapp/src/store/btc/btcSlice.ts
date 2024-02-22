import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { fetchBTCPriceUSD } from "./btcThunk"

type BtcState = {
  isLoadingPriceUSD: boolean
  usdPrice: number
}

const initialState: BtcState = {
  isLoadingPriceUSD: false,
  usdPrice: 0,
}

// Store Bitcoin data such as balance, balance in usd and other related data to Bitcoin chain.
export const btcSlice = createSlice({
  name: "btc",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBTCPriceUSD.pending, (state) => {
      state.isLoadingPriceUSD = true
    })
    builder.addCase(fetchBTCPriceUSD.rejected, (state) => {
      state.isLoadingPriceUSD = false
    })
    builder.addCase(
      fetchBTCPriceUSD.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.isLoadingPriceUSD = false
        state.usdPrice = action.payload
      },
    )
  },
})
