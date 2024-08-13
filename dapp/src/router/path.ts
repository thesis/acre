export const SEARCH_PARAMS_NAMES = {
  referral: "ref",
}

export const routerPath = {
  home: "/",
  dashboard: "/dashboard",
} as const

export type Pathname = (typeof routerPath)[keyof typeof routerPath]
