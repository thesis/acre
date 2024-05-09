import React from "react"
import Layout from "#/components/Layout"
import ActivityPage from "#/pages/ActivityPage"
import DashboardPage from "#/pages/DashboardPage"
import LandingPage from "#/pages/LandingPage"
import { createBrowserRouter } from "react-router-dom"
import { routerPath } from "./path"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        path: routerPath.home,
        element: <LandingPage />,
      },
      {
        path: routerPath.dashboard,
        element: <DashboardPage />,
      },
      {
        path: `${routerPath.activity}/:activityId`,
        element: <ActivityPage />,
      },
    ],
  },
])
