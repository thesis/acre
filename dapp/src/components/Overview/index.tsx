import React from "react"
import { Grid, GridItem, useColorModeValue } from "@chakra-ui/react"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"

export default function Overview() {
  const bg = useColorModeValue("white", "grey.400")
  return (
    <Grid
      h="90vh"
      templateRows="repeat(5, 1fr)"
      templateColumns="repeat(6, 1fr)"
      gap={4}
    >
      <GridItem colSpan={2} rowSpan={2} bg={bg}>
        <PositionDetails />
      </GridItem>
      <GridItem colSpan={4} rowSpan={2} bg={bg}>
        <Statistics />
      </GridItem>
      <GridItem colSpan={6} rowSpan={3} bg={bg}>
        <TransactionHistory />
      </GridItem>
    </Grid>
  )
}
