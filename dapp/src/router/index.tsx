import React from "react"
import { createBrowserRouter } from "react-router-dom"
import OverviewPage from "#/pages/OverviewPage"
import ActivityPage from "#/pages/ActivityPage"

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
