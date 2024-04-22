import React from "react"
import { createBrowserRouter } from "react-router-dom"
import LandingPage from "#/pages/LandingPage"
import ActivityPage from "#/pages/ActivityPage"
import DashboardPage from "#/pages/DashboardPage"
import { routerPath } from "./path"

export const router = createBrowserRouter([
  {
    path: routerPath.home,
    element: <LandingPage />,
    index: true,
  },
  {
    path: routerPath.dashboard,
    element: <DashboardPage />,
  },
  {
    path: `${routerPath.activity}/:activityId`,
    element: <ActivityPage />,
  },
])
