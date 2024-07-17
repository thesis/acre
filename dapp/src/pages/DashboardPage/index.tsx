import React from "react"
import { useDepositCallToAction, useTriggerConnectWalletModal } from "#/hooks"
import { routerPath } from "#/router/path"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import DashboardCard from "./DashboardCard"
import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"

export default function DashboardPage() {
  useDepositCallToAction()
  useTriggerConnectWalletModal(routerPath.dashboard)

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
