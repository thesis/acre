import { encodeJSON } from "#/utils"
import { devToolsEnhancer } from "@redux-devtools/extension"

// This sanitizer runs on store and action data before serializing for remote
// redux devtools. The goal is to end up with an object that is directly
// JSON-serializable and deserializable; the remote end will display the
// resulting objects without additional processing or decoding logic.
function devToolsSanitizer<T>(input: T) {
  switch (typeof input) {
    // We can make use of encodeJSON instead of recursively looping through
    // the input
    case "bigint":
    case "object":
      // We only need to sanitize bigints and objects
      // that may or may not contain them.
      return JSON.parse(encodeJSON(input)) as T
    default:
      return input
  }
}

export const enhancers = import.meta.env.DEV
  ? {
      autoBatch: undefined,
      devToolsEnhancer: devToolsEnhancer({
        actionSanitizer: devToolsSanitizer,
        stateSanitizer: devToolsSanitizer,
      }),
    }
  : {}
