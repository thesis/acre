import { DevToolsEnhancerOptions } from "@reduxjs/toolkit"
import { encodeJSON } from "#/utils"
import { env } from "#/constants"

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

export const devTools = !env.PROD
  ? ({
      actionSanitizer: devToolsSanitizer,
      stateSanitizer: devToolsSanitizer,
    } as DevToolsEnhancerOptions)
  : false
