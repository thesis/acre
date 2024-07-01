import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { fetchBTCPriceUSD } from "./btcThunk"

type BtcState = {
  isLoadingPriceUSD: boolean
  usdPrice: number
  minDepositAmount: bigint
  totalAssets: bigint
}

const initialState: BtcState = {
  isLoadingPriceUSD: false,
  usdPrice: 0,
  minDepositAmount: 0n,
  totalAssets: 0n,
}

// Store Bitcoin data such as balance, balance in usd and other related data to Bitcoin chain.
export const btcSlice = createSlice({
  name: "btc",
  initialState,
  reducers: {
    setMinDepositAmount(state, action: PayloadAction<bigint>) {
      state.minDepositAmount = action.payload
    },
    setTotalAssets(state, action: PayloadAction<bigint>) {
      state.totalAssets = action.payload
    },
  },
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

export const { setMinDepositAmount, setTotalAssets } = btcSlice.actions
