import React from "react"
import { useIsEmbed, useTriggerConnectWalletModal } from "#/hooks"
import { featureFlags } from "#/constants"
import { Grid } from "@chakra-ui/react"
import DashboardCard from "./DashboardCard"
import { PageLayout, PageLayoutColumn } from "./PageLayout"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"
import UsefulLinks from "./UsefulLinks"

const TEMPLATE_AREAS_LEDGER_LIVE = `${featureFlags.TVL_ENABLED ? '"dashboard current-season"' : ""}
                                    ${featureFlags.BEEHIVE_COMPONENT_ENABLED ? '"dashboard beehive"' : ""}
                                    "dashboard acre-points"
                                    "dashboard useful-links"`

export default function DashboardPage() {
  const { isEmbed } = useIsEmbed()

  useTriggerConnectWalletModal()

  if (isEmbed)
    return (
      <Grid
        gridGap={{ base: 4, "2xl": 8 }}
        gridTemplateColumns={{
          base: "1fr 1fr",
          lg: "1fr 31%",
          "2xl": "1fr 36%",
        }}
        templateAreas={TEMPLATE_AREAS_LEDGER_LIVE}
      >
        <DashboardCard gridArea="dashboard" h="fit-content" />
        {/* TODO: Uncomment in post-launch phases + add `gridArea` and update  `templateAreas` */}
        {/* <GrantedSeasonPassCard /> */}
        {featureFlags.TVL_ENABLED && (
          <CurrentSeasonCard
            showSeasonStats={false}
            gridArea="current-season"
          />
        )}
        {featureFlags.BEEHIVE_COMPONENT_ENABLED && (
          <BeehiveCard gridArea="beehive" />
        )}
        <AcrePointsCard gridArea="acre-points" />
        <UsefulLinks gridArea="useful-links" />
      </Grid>
    )

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
