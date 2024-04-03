/**
 * Encode an unknown input as JSON, special-casing bigints and undefined.
 *
 * @param input an object, array, or primitive to encode as JSON
 */
export function encodeJSON(input: unknown): string {
  return JSON.stringify(input, (_, value): object | null => {
    if (typeof value === "bigint") {
      return { B_I_G_I_N_T: value.toString() }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value
  })
}
