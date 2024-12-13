import { isPlain } from "@reduxjs/toolkit"

export default {
  serializableCheck: {
    isSerializable: (value: unknown) =>
      isPlain(value) || typeof value === "bigint",
  },
}
