export const SEARCH_PARAMS_NAMES = {
  referral: "ref",
  embed: "embed",
  themeMode: "theme",
}

export const routerPath = {
  home: "/dashboard",
} as const

export type Pathname = (typeof routerPath)[keyof typeof routerPath]
