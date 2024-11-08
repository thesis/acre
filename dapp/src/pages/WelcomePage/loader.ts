import redirectWithSearchParams from "#/router/utils"
import { shouldDisplayWelcomeModal } from "#/utils"
import { LoaderFunction } from "react-router-dom"

const welcomePageLoader: LoaderFunction = ({ request }) =>
  shouldDisplayWelcomeModal()
    ? null
    : redirectWithSearchParams(request.url, "/dashboard")

export default welcomePageLoader
