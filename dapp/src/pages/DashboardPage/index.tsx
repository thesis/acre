import React from "react"
import { useDepositCallToAction } from "#/hooks"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"

export default function DashboardPage() {
  useDepositCallToAction()

  return (
    <PageLayout>
      <PageLayoutColumn isMain>
        <DashboardCard />
      </PageLayoutColumn>

      <PageLayoutColumn>
        <CurrentSeasonCard showSeasonStats={false} />
        <GrantedSeasonPassCard />
      </PageLayoutColumn>

      <PageLayoutColumn position="relative">
        <BeehiveCard />
      </PageLayoutColumn>
    </PageLayout>
  )
}
