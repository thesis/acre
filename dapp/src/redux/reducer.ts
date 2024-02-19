import { combineReducers } from "@reduxjs/toolkit"
import * as combinedSlices from "./slices"

export const reducer = combineReducers({
  ...combinedSlices,
})
