import { createAsyncThunk } from "@reduxjs/toolkit"
import { subgraphAPI } from "#/utils"
import { setActivities } from "./walletSlice"

export const fetchActivities = createAsyncThunk(
  "wallet/fetchActivities",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (btcAddress: string, { dispatch }) => {
    // TODO: Use the correct deposit owner address for the specified BTC account
    const depositOwner = "0x4c9e39e5ff458a811708c03aea21b8327118cf13"
    const result = await subgraphAPI.fetchActivityDatas(depositOwner)

    dispatch(setActivities(result))
  },
)
