import { configureStore } from "@reduxjs/toolkit"
import { middleware } from "./middleware"
import { reducer } from "./reducer"
import { devTools } from "./devTools"

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(middleware),
  devTools,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
