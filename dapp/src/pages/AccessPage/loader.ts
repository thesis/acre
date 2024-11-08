import { getAccessCodeFromLocalStorage } from "#/hooks/useAccessCode"
import redirectWithSearchParams from "#/router/utils"
import { acreApi, shouldDisplayWelcomeModal } from "#/utils"
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
        ? redirectWithSearchParams(url, "/welcome")
        : !redirectToOnSuccess ||
            redirectWithSearchParams(url, redirectToOnSuccess)
    }

    return redirectToOnFail
      ? redirectWithSearchParams(url, redirectToOnFail)
      : null
  } catch (error) {
    console.error("Failed to verify access code")

    return redirectToOnFail
      ? redirectWithSearchParams(url, redirectToOnFail)
      : null
  }
}

const accessPageLoader: LoaderFunction = async ({ request }) =>
  redirectToAccessPageLoader(request.url, "/dashboard")

export default accessPageLoader
