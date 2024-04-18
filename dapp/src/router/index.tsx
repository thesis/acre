import React from "react"
import { createBrowserRouter } from "react-router-dom"
import LandingPage from "#/pages/LandingPage"
import OverviewPage from "#/pages/OverviewPage"
import Layout from "#/components/shared/Layout"
import ActivityPage from "#/pages/ActivityPage"
import { routerPath } from "./path"

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: routerPath.home,
        element: <LandingPage />,
        index: true,
      },
      {
        path: routerPath.overview,
        element: <OverviewPage />,
      },
      {
        path: `${routerPath.activity}/:activityId`,
        element: <ActivityPage />,
      },
    ],
  },
])
