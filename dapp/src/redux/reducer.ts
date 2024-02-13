import { combineReducers } from "@reduxjs/toolkit"
import * as combinedSlices from "./slices"

export default combineReducers({
  ...combinedSlices,
})
