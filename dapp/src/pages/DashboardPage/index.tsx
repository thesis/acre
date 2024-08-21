import React from "react"
import {
  useDepositCallToAction,
  useTriggerConnectWalletModal,
  useMobileMode,
} from "#/hooks"
import MobileModeBanner from "#/components/MobileModeBanner"
import { routerPath } from "#/router/path"
import { featureFlags } from "#/constants"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"

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
        {featureFlags.TVL_ENABLED && (
          <CurrentSeasonCard showSeasonStats={false} />
        )}
        {/* TODO: Uncomment in post-launch phases */}
        {/* <GrantedSeasonPassCard /> */}
        {featureFlags.BEEHIVE_COMPONENT_ENABLED && <BeehiveCard />}
      </PageLayoutColumn>

      <PageLayoutColumn position="relative">
        <AcrePointsCard />
      </PageLayoutColumn>
    </PageLayout>
  )
}
