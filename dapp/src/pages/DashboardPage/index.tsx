import React from "react"
import {
  useDepositCallToAction,
  useTriggerConnectWalletModal,
  useMobileMode,
} from "#/hooks"
import MobileModeBanner from "#/components/MobileModeBanner"
import { routerPath } from "#/router/path"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"

export default function DashboardPage() {
  const isMobileMode = useMobileMode()
  useTriggerConnectWalletModal(routerPath.dashboard)
  useDepositCallToAction()

  return isMobileMode ? (
    <MobileModeBanner forceOpen />
  ) : (
    <PageLayout>
      <PageLayoutColumn isMain>
        <DashboardCard />
      </PageLayoutColumn>

      <PageLayoutColumn>
        <CurrentSeasonCard showSeasonStats={false} />
        {/* TODO: Uncomment in post-launch phases */}
        {/* <GrantedSeasonPassCard /> */}
      </PageLayoutColumn>

      <PageLayoutColumn position="relative">
        <AcrePointsCard />
      </PageLayoutColumn>
    </PageLayout>
  )
}
