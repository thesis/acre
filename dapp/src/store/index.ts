import { configureStore } from "@reduxjs/toolkit"
import devTools from "./devTools"
import middleware from "./middleware"
import reducer from "./reducer"

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(middleware),
  devTools,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
