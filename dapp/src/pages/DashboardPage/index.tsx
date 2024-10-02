import React from "react"
import { useMobileMode, useTriggerConnectWalletModal } from "#/hooks"
import MobileModeBanner from "#/components/MobileModeBanner"
import { featureFlags } from "#/constants"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"
import UsefulLinks from "./UsefulLinks"

export default function DashboardPage() {
  const isMobileMode = useMobileMode()

  useTriggerConnectWalletModal()

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
        <UsefulLinks />
      </PageLayoutColumn>
    </PageLayout>
  )
}
