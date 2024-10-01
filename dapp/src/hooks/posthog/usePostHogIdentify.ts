import { featureFlags } from "#/constants"
import { usePostHog } from "posthog-js/react"
import { useCallback, useEffect } from "react"
import { hashString, isSameETHAddress, logPromiseFailure } from "#/utils"
import { EventCallback, useSubscribeToConnectorEvent } from "@orangekit/react"
import { getAddress } from "ethers"
import { useConfig } from "wagmi"
import { useWallet } from "../useWallet"
import { useConnector } from "../orangeKit"

export const usePostHogIdentify = () => {
  const postHog = usePostHog()
  const connector = useConnector()
  const { address } = useWallet()
  const wagmiConfig = useConfig()

  useEffect(() => {
    if (!featureFlags.POSTHOG_ENABLED || !address) return

    const handleIdentify = async () => {
      const hashedAccountAddress = await hashString({
        value: address.toUpperCase(),
      })

      postHog.identify(hashedAccountAddress)
    }

    logPromiseFailure(handleIdentify())
  }, [postHog, address])

  const handleConnectorChange = useCallback<EventCallback<"change">>(
    (updated) => {
      const [updatedAddress] = updated.accounts || []

      if (!updatedAddress) {
        postHog.reset()
        return
      }

      const isChanged =
        updatedAddress && address && !isSameETHAddress(updatedAddress, address)

      if (isChanged) {
        postHog.reset()
        postHog.identify(getAddress(updatedAddress))
      }
    },
    [postHog, address],
  )

  const handleConnectorDisconnect = useCallback<
    EventCallback<"disconnect">
  >(() => {
    postHog.reset()
  }, [postHog])

  useSubscribeToConnectorEvent(
    wagmiConfig,
    connector!.name,
    "change",
    handleConnectorChange,
  )

  useSubscribeToConnectorEvent(
    wagmiConfig,
    connector!.name,
    "disconnect",
    handleConnectorDisconnect,
  )
}
