import { router, shouldDisplayWelcomeModal } from "#/utils"
import { LoaderFunction } from "react-router-dom"

const welcomePageLoader: LoaderFunction = ({ request }) =>
  shouldDisplayWelcomeModal()
    ? null
    : router.redirectWithSearchParams(request.url, "/dashboard")

export default welcomePageLoader
