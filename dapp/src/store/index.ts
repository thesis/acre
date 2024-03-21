import { configureStore } from "@reduxjs/toolkit"
import { middleware } from "./middleware"
import { reducer } from "./reducer"
import { enhancers } from "./enhancers"

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(middleware),
  enhancers: (getDefaultEnhancers) => getDefaultEnhancers(enhancers),
  devTools: !import.meta.env.PROD,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
