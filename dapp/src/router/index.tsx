import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import LandingPage from "#/pages/LandingPage"
import ActivityPage from "#/pages/ActivityPage"
import DashboardPage from "#/pages/DashboardPage"
import Layout from "#/components/shared/Layout"
import { routerPath } from "./path"

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index path={routerPath.home} element={<LandingPage />} />
          <Route path={routerPath.dashboard} element={<DashboardPage />} />
          <Route
            path={`${routerPath.activity}/:activityId`}
            element={<ActivityPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
