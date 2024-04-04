import { encodeJSON } from "#/utils"

function devToolsSanitizer(input: unknown): unknown {
  switch (typeof input) {
    // We can make use of encodeJSON instead of recursively looping through
    // the input
    case "bigint":
    case "object":
      // We only need to sanitize bigints and objects
      // that may or may not contain them.
      return JSON.parse(encodeJSON(input))
    default:
      return input
  }
}

export const devTools = !import.meta.env.PROD
  ? {
      actionSanitizer: devToolsSanitizer,
      stateSanitizer: devToolsSanitizer,
    }
  : false
