import React from "react"
import {
  useDepositCallToAction,
  useTriggerConnectWalletModal,
  useMobileMode,
} from "#/hooks"
import MobileModeBanner from "#/components/MobileModeBanner"
import { routerPath } from "#/router/path"
import { EXTERNAL_HREF, featureFlags } from "#/constants"
import { VStack } from "@chakra-ui/react"
import CardButton from "#/components/shared/CardButton"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
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
        <CurrentSeasonCard showSeasonStats={false} />
        {featureFlags.BEEHIVE_COMPONENT_ENABLED && <BeehiveCard />}
      </PageLayoutColumn>

      <PageLayoutColumn position="relative">
        {featureFlags.ACRE_POINTS_ENABLED && <AcrePointsCard />}

        <VStack spacing={2} align="stretch">
          <CardButton href={EXTERNAL_HREF.DOCS} isExternal>
            Documentation
          </CardButton>
          <CardButton href={EXTERNAL_HREF.BLOG} isExternal>
            Blog
          </CardButton>
          <CardButton href={EXTERNAL_HREF.FAQ} isExternal>
            FAQ
          </CardButton>
        </VStack>
      </PageLayoutColumn>
    </PageLayout>
  )
}
