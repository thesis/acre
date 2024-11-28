import { SEARCH_PARAMS_NAMES } from "#/router/path"
import router from "./router"

const embeddedApps = ["ledger-live"] as const
export type EmbedApp = (typeof embeddedApps)[number]

const MAX_UINT16 = 65535
const EMBEDDED_APP_TO_REFERRAL: Record<EmbedApp, number> = {
  "ledger-live": 2083,
}

const isValidReferral = (value: unknown) => {
  let valueAsNumber: number | undefined

  if (typeof value === "string") {
    // Only digits w/o leading zeros.
    const isNumber = /^(?:[1-9][0-9]*|0)$/.test(value)
    valueAsNumber = isNumber ? Number(value) : undefined
  } else if (typeof value === "number") {
    valueAsNumber = value
  }

  return (
    !!valueAsNumber &&
    Number.isInteger(valueAsNumber) &&
    valueAsNumber >= 0 &&
    valueAsNumber <= MAX_UINT16
  )
}

const getReferralFromURL = () =>
  router.getURLParam(SEARCH_PARAMS_NAMES.referral)

const getReferralByEmbeddedApp = (embedApp: EmbedApp) =>
  EMBEDDED_APP_TO_REFERRAL[embedApp]

const getEmbeddedApp = (href: string = window.location.href) =>
  router.getURLParamFromHref(href, SEARCH_PARAMS_NAMES.embed)

function isEmbedApp(embedApp: unknown): embedApp is EmbedApp {
  return (
    typeof embedApp === "string" &&
    embeddedApps.findIndex((app) => app === embedApp) >= 0
  )
}
export default {
  isValidReferral,
  getReferralFromURL,
  getEmbeddedApp,
  isEmbedApp,
  getReferralByEmbeddedApp,
}
