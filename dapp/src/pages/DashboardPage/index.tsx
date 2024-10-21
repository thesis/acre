import React from "react"
import { useMobileMode } from "#/hooks"
import MobileModeBanner from "#/components/MobileModeBanner"
import { featureFlags } from "#/constants"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"
import UsefulLinks from "./UsefulLinks"
import AcrePointsTemplateCard from "./AcrePointsTemplateCard"

export default function DashboardPage() {
  const isMobileMode = useMobileMode()

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

        {featureFlags.BEEHIVE_COMPONENT_ENABLED && <BeehiveCard />}
      </PageLayoutColumn>

      <PageLayoutColumn position="relative">
        {featureFlags.ACRE_POINTS_ENABLED ? (
          <AcrePointsCard />
        ) : (
          <AcrePointsTemplateCard />
        )}
        <UsefulLinks />
      </PageLayoutColumn>
    </PageLayout>
  )
}
