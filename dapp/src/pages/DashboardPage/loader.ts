import { referralProgram, shouldDisplayWelcomeModal } from "#/utils"
import { LoaderFunction } from "react-router-dom"
import redirectWithSearchParams from "#/router/utils"
import { redirectToAccessPageLoader } from "../AccessPage/loader"

const dashboardPageLoader: LoaderFunction = async (args) => {
  const { request } = args

  if (referralProgram.isEmbedApp(referralProgram.getEmbeddedApp(request.url)))
    return shouldDisplayWelcomeModal()
      ? redirectWithSearchParams(request.url, "/welcome")
      : null

  return redirectToAccessPageLoader(request.url, null, "/access")
}

export default dashboardPageLoader
