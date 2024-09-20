import React from "react"
import Layout from "#/components/Layout"
import DashboardPage from "#/pages/DashboardPage"
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
        element: <DashboardPage />,
      },
    ],
  },
])
