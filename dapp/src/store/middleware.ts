import { isPlain } from "@reduxjs/toolkit"

export const middleware = {
  serializableCheck: {
    isSerializable: (value: unknown) =>
      isPlain(value) || typeof value === "bigint",
  },
}
