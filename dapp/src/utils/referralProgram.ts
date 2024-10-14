import { SEARCH_PARAMS_NAMES } from "#/router/path"
import router from "./router"

const embeddedApps = ["ledger-live"] as const
export type EmbedApp = (typeof embeddedApps)[number]

const EMBEDDED_APP_TO_REFERRAL: Record<EmbedApp, number> = {
  "ledger-live": 2083,
}

const getReferralByEmbeddedApp = (embedApp: EmbedApp) =>
  EMBEDDED_APP_TO_REFERRAL[embedApp]

function isEmbedApp(embedApp: unknown): embedApp is EmbedApp {
  return (
    typeof embedApp === "string" &&
    embeddedApps.findIndex((app) => app === embedApp) >= 0
  )
}

const getEmbeddedApp = () => {
  const app = router.getURLParam(SEARCH_PARAMS_NAMES.embed)

  return isEmbedApp(app) ? app : undefined
}

export default {
  getEmbeddedApp,
  isEmbedApp,
  getReferralByEmbeddedApp,
}
