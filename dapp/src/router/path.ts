export const routerPath = {
  home: "/",
  dashboard: "/dashboard",
} as const

export type Pathname = (typeof routerPath)[keyof typeof routerPath]
