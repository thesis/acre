import { isPlain } from "@reduxjs/toolkit"

export const middleware = {
  serializableCheck: {
    isSerializable: (value: unknown) =>
      isPlain(value) || typeof value === "bigint",
    // // Ignore these action types
    ignoredActions: ["modal/openModal"],
    // Ignore these field paths in all actions
    ignoredPaths: ["modal.props.closeModal"],
  },
}
