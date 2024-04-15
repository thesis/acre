import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import OverviewPage from "#/pages/OverviewPage"
import ActivityPage from "#/pages/ActivityPage"
import Layout from "#/components/shared/Layout"
import { routerPath } from "./path"

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index path={routerPath.home} element={<OverviewPage />} />
          <Route
            path={`${routerPath.activity}/:activityId`}
            element={<ActivityPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
