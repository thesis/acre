import React from "react"
import { createBrowserRouter } from "react-router-dom"
import OverviewPage from "#/pages/Overview"
import ActivityPage from "#/pages/Activity"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <OverviewPage />,
  },
  {
    path: "activity-details",
    element: <ActivityPage />,
  },
])
