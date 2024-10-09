import React from "react"
import { useTriggerConnectWalletModal } from "#/hooks"
import { featureFlags } from "#/constants"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"
import UsefulLinks from "./UsefulLinks"

export default function DashboardPage() {
  useTriggerConnectWalletModal()

  return (
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
