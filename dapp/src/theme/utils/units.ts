// The values are proportional, so 1 spacing unit is equal to 0.25rem, which translates to 4px by default in common browsers.
const chakraSpacingUnit = {
  px: 4,
  rem: 0.25,
}
export const chakraUnitToPx = (chakraUnit: number): number =>
  chakraUnit * chakraSpacingUnit.px
