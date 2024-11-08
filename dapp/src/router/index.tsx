import React from "react"
import Layout from "#/components/Layout"
import DashboardPage from "#/pages/DashboardPage"
import { createBrowserRouter, LoaderFunction } from "react-router-dom"
import { shouldDisplayWelcomeModal, referralProgram } from "#/utils"
import dashboardPageLoader from "#/pages/DashboardPage/loader"
import AccessPage from "#/pages/AccessPage"
import WelcomePage from "#/pages/WelcomePage"
import welcomePageLoader from "#/pages/WelcomePage/loader"
import accessPageLoader from "#/pages/AccessPage/loader"
import redirectWithSearchParams from "./utils"
import { routerPath } from "./path"

const mainLayoutLoader: LoaderFunction = ({ request }) => {
  const embedApp = referralProgram.getEmbeddedApp(request.url)

  if (referralProgram.isEmbedApp(embedApp)) {
    const shouldRedirectToWelcomeModal = !shouldDisplayWelcomeModal()

    return shouldRedirectToWelcomeModal
      ? redirectWithSearchParams(request.url, "/welcome")
      : redirectWithSearchParams(request.url, "/dashboard")
  }

  return redirectWithSearchParams(request.url, "/access")
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
