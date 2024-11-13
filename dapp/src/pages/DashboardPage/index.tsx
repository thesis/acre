import React from "react"
import { featureFlags } from "#/constants"
import { useTriggerConnectWalletModal } from "#/hooks"
import { Grid } from "@chakra-ui/react"
import DashboardCard from "./DashboardCard"
// import GrantedSeasonPassCard from "./GrantedSeasonPassCard"
import AcrePointsCard from "./AcrePointsCard"
import AcrePointsTemplateCard from "./AcrePointsTemplateCard"
import BeehiveCard from "./BeehiveCard"
import { AcreTVLProgress } from "./AcreTVLProgress"

const TEMPLATE_AREAS = `
  ${featureFlags.TVL_ENABLED ? '"tvl tvl"' : ""}
  "dashboard acre-points"
  "dashboard beehive"
  "dashboard useful-links"
`

const GRID_TEMPLATE_ROWS = `${featureFlags.TVL_ENABLED ? "auto" : ""} auto auto 1fr`

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
      {featureFlags.TVL_ENABLED && <AcreTVLProgress gridArea="tvl" />}

      <DashboardCard gridArea="dashboard" h="fit-content" />

      {/* TODO: Uncomment in post-launch phases + add `gridArea` and update  `templateAreas` */}
      {/* <GrantedSeasonPassCard /> */}

      {featureFlags.ACRE_POINTS_ENABLED ? (
        <AcrePointsCard gridArea="acre-points" />
      ) : (
        <AcrePointsTemplateCard gridArea="acre-points" />
      )}

      <BeehiveCard gridArea="beehive" />
    </Grid>
  )
}
