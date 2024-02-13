import { configureStore } from "@reduxjs/toolkit"
import { preloadedState } from "./state"
import combinedReducer from "./reducer"
import combinedMiddleware from "./middleware"

export const reduxStore = configureStore({
  reducer: combinedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(combinedMiddleware),
  preloadedState,
  devTools: process.env.NODE_ENV !== "production",
})
