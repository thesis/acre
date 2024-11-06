import React from "react"
import Layout from "#/components/Layout"
import DashboardPage from "#/pages/DashboardPage"
import { createBrowserRouter, redirectDocument } from "react-router-dom"
import { referralProgram } from "#/utils"
import { routerPath } from "./path"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: ({ request }) => {
      const embedApp = referralProgram.getEmbeddedApp(request.url)

      if (!!embedApp && !referralProgram.isEmbedApp(embedApp)) {
        return redirectDocument("/")
      }

      return null
    },
    children: [
      {
        index: true,
        path: routerPath.home,
        element: <DashboardPage />,
      },
    ],
  },
])
