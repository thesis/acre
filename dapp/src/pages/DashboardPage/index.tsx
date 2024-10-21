import React from "react"
import { useTriggerConnectWalletModal } from "#/hooks"
import { featureFlags } from "#/constants"
import { Grid } from "@chakra-ui/react"
import DashboardCard from "./DashboardCard"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import { CurrentSeasonCard } from "./CurrentSeasonCard"
import BeehiveCard from "./BeehiveCard"
import UsefulLinks from "./UsefulLinks"
import AcrePointsTemplateCard from "./AcrePointsTemplateCard"

const TEMPLATE_AREAS = `
  ${featureFlags.TVL_ENABLED ? '"dashboard current-season"' : ""}
  "dashboard acre-points"
  ${featureFlags.BEEHIVE_COMPONENT_ENABLED ? '"dashboard beehive"' : ""}
  "dashboard useful-links"
`

const GRID_TEMPLATE_ROWS = `${featureFlags.TVL_ENABLED ? "auto" : ""} ${featureFlags.BEEHIVE_COMPONENT_ENABLED ? "auto" : ""} auto 1fr`

export default function DashboardPage() {
  useTriggerConnectWalletModal()

  return (
    <Grid
      gridGap={{ base: 4, "2xl": 8 }}
      templateAreas={TEMPLATE_AREAS}
      gridTemplateColumns={{
        base: "1fr 1fr",
        lg: "1fr 31%",
        "2xl": "1fr 36%",
      }}
      gridTemplateRows={GRID_TEMPLATE_ROWS}
    >
      <DashboardCard gridArea="dashboard" h="fit-content" />
      {/* TODO: Uncomment in post-launch phases + add `gridArea` and update  `templateAreas` */}
      {/* <GrantedSeasonPassCard /> */}
      {featureFlags.TVL_ENABLED && (
        <CurrentSeasonCard showSeasonStats={false} gridArea="current-season" />
      )}
      {featureFlags.ACRE_POINTS_ENABLED ? (
        <AcrePointsCard gridArea="acre-points" />
      ) : (
        <AcrePointsTemplateCard gridArea="acre-points" />
      )}
      {featureFlags.BEEHIVE_COMPONENT_ENABLED && (
        <BeehiveCard gridArea="beehive" />
      )}
      <UsefulLinks gridArea="useful-links" />
    </Grid>
  )
}
