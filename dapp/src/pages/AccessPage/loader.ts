import { featureFlags } from "#/constants"
import { getAccessCodeFromLocalStorage } from "#/hooks/useAccessCode"
import { acreApi, router, shouldDisplayWelcomeModal } from "#/utils"
import { LoaderFunction } from "react-router-dom"

const resolveSuccessRedirect = (
  url: string,
  redirectToOnSuccess: null | string = null,
) =>
  shouldDisplayWelcomeModal()
    ? router.redirectWithSearchParams(url, "/welcome")
    : !redirectToOnSuccess ||
      router.redirectWithSearchParams(url, redirectToOnSuccess)

export const redirectToAccessPageLoader = async (
  url: string,
  redirectToOnSuccess: null | string = null,
  redirectToOnFail: null | string = null,
) => {
  if (!featureFlags.GATING_DAPP_ENABLED) {
    return resolveSuccessRedirect(url, redirectToOnSuccess)
  }

  try {
    const encodedCode = getAccessCodeFromLocalStorage()

    const isValid = encodedCode
      ? await acreApi.verifyAccessCode(encodedCode)
      : false

    if (isValid) {
      return resolveSuccessRedirect(url, redirectToOnSuccess)
    }

    return redirectToOnFail
      ? router.redirectWithSearchParams(url, redirectToOnFail)
      : null
  } catch (error) {
    console.error("Failed to verify access code")

    return redirectToOnFail
      ? router.redirectWithSearchParams(url, redirectToOnFail)
      : null
  }
}

const accessPageLoader: LoaderFunction = async ({ request }) =>
  redirectToAccessPageLoader(request.url, "/dashboard")

export default accessPageLoader
