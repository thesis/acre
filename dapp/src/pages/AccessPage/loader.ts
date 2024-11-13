import { getAccessCodeFromLocalStorage } from "#/hooks/useAccessCode"
import { acreApi, router, shouldDisplayWelcomeModal } from "#/utils"
import { LoaderFunction } from "react-router-dom"

export const redirectToAccessPageLoader = async (
  url: string,
  redirectToOnSuccess: null | string = null,
  redirectToOnFail: null | string = null,
) => {
  try {
    const isValid = await acreApi.verifyAccessCode(
      getAccessCodeFromLocalStorage() ?? "",
    )

    if (isValid) {
      const shouldRedirectToWelcomeModal = shouldDisplayWelcomeModal()

      return shouldRedirectToWelcomeModal
        ? router.redirectWithSearchParams(url, "/welcome")
        : !redirectToOnSuccess ||
            router.redirectWithSearchParams(url, redirectToOnSuccess)
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
