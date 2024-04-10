import React from "react"
import { createBrowserRouter } from "react-router-dom"
import OverviewPage from "#/pages/OverviewPage"
import ActivityPage from "#/pages/ActivityPage"
import { routerPath } from "./path"

export const router = createBrowserRouter([
  {
    path: routerPath.home,
    element: <OverviewPage />,
  },
  {
    path: `${routerPath.activity}/:activityId`,
    element: <ActivityPage />,
  },
])
