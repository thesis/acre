export const SEARCH_PARAMS_NAMES = {
  referral: "ref",
}

export const routerPath = {
  home: "/",
} as const

export type Pathname = (typeof routerPath)[keyof typeof routerPath]
