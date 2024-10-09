import { SEARCH_PARAMS_NAMES } from "#/router/path"
import router from "./router"

const embeddedApps = ["ledger-live"] as const
export type EmbedApp = (typeof embeddedApps)[number]

const MAX_UINT16 = 65535
const EMBEDDED_APP_TO_REFERRAL: Record<EmbedApp, number> = {
  // TODO: set correct referral code
  "ledger-live": 123,
}

const isValidReferral = (value: number) => {
  const isInteger = Number.isInteger(value)
  return isInteger && value >= 0 && value <= MAX_UINT16
}

const getReferralFromURL = () =>
  router.getURLParam(SEARCH_PARAMS_NAMES.referral)

const getReferralByEmbeddedApp = (embedApp: EmbedApp) =>
  EMBEDDED_APP_TO_REFERRAL[embedApp]

const getEmbeddedApp = () => router.getURLParam(SEARCH_PARAMS_NAMES.embed)

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
