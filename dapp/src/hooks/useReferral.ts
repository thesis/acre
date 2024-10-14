import { env } from "#/constants"
import { referralProgram } from "#/utils"
import useIsEmbed from "./useIsEmbed"

export default function useReferral() {
  const { embeddedApp } = useIsEmbed()

  return embeddedApp
    ? referralProgram.getReferralByEmbeddedApp(embeddedApp)
    : env.REFERRAL
}
