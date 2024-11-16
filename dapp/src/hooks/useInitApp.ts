import { PostHogEvent } from "#/posthog/events"
import { useAccountChangedOKX } from "./orangeKit/useAccountChangedOKX"
import { useAccountsChangedUnisat } from "./orangeKit/useAccountsChangedUnisat"
import { useAccountsChangedOKX } from "./orangeKit/useAccountsChangedOKX"
import { useInitDataFromSdk, useInitializeAcreSdk } from "./sdk"
import { useSentry } from "./sentry"
import useDetectEmbed from "./useDetectEmbed"
import useDetectReferral from "./useDetectReferral"
import { useDisconnectWallet } from "./useDisconnectWallet"
import { useFetchBTCPriceUSD } from "./useFetchBTCPriceUSD"
import { usePostHogCapture } from "./posthog/usePostHogCapture"

export function useInitApp() {
  const handleCapture = usePostHogCapture()

  // TODO: Let's uncomment when dark mode is ready
  // useDetectThemeMode()
  useSentry()
  useDetectEmbed()
  useDetectReferral()
  useInitializeAcreSdk()
  useInitDataFromSdk()
  useFetchBTCPriceUSD()
  useDisconnectWallet()
  useAccountChangedOKX()
  useAccountsChangedOKX()
  useAccountsChangedUnisat()
  handleCapture(PostHogEvent.PageView)
}
