import React from "react"
import Layout from "#/components/Layout"
import DashboardPage from "#/pages/DashboardPage"
import { createBrowserRouter, LoaderFunction } from "react-router-dom"
import {
  shouldDisplayWelcomeModal,
  referralProgram,
  router as routerUtils,
} from "#/utils"
import dashboardPageLoader from "#/pages/DashboardPage/loader"
import AccessPage from "#/pages/AccessPage"
import WelcomePage from "#/pages/WelcomePage"
import welcomePageLoader from "#/pages/WelcomePage/loader"
import accessPageLoader from "#/pages/AccessPage/loader"
import { writeReferral } from "#/hooks/useReferral"
import { env } from "#/constants"
import { routerPath } from "./path"

const mainLayoutLoader: LoaderFunction = ({ request }) => {
  const embedApp = referralProgram.getEmbeddedApp(request.url)

  if (referralProgram.isEmbedApp(embedApp)) {
    const shouldRedirectToWelcomeModal = !shouldDisplayWelcomeModal()

    return shouldRedirectToWelcomeModal
      ? routerUtils.redirectWithSearchParams(request.url, "/welcome")
      : routerUtils.redirectWithSearchParams(request.url, "/dashboard")
  }

  return routerUtils.redirectWithSearchParams(request.url, "/access")
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: ({ request }) => {
      // TODO: display the error page/modal when the referral is invalid.
      const referralCode = referralProgram.getReferralFromURL() ?? env.REFERRAL
      if (
        referralCode &&
        referralProgram.isValidReferral(Number(referralCode))
      ) {
        writeReferral(referralCode.toString())
      }

      const embedApp = referralProgram.getEmbeddedApp(request.url)
      if (referralProgram.isEmbedApp(embedApp)) {
        writeReferral(
          referralProgram.getReferralByEmbeddedApp(embedApp).toString(),
        )
      }
      return null
    },
    children: [
      {
        index: true,
        loader: mainLayoutLoader,
      },
      {
        path: routerPath.home,
        element: <DashboardPage />,
        loader: dashboardPageLoader,
      },
      {
        path: "/access",
        element: <AccessPage />,
        loader: accessPageLoader,
      },
      {
        path: "/welcome",
        element: <WelcomePage />,
        loader: welcomePageLoader,
      },
    ],
  },
])
