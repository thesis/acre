import { configureStore } from "@reduxjs/toolkit"
import combinedMiddleware from "./middleware"
import { reducer } from "./reducer"

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(combinedMiddleware),
  devTools: true
})
