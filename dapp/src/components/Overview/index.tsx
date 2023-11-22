import React from "react"
import { Grid, GridItem, useColorModeValue } from "@chakra-ui/react"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"

export default function Overview() {
  const bg = useColorModeValue("white", "grey.400")
  return (
    <Grid
      h="80vh"
      templateRows="repeat(12, 1fr)"
      templateColumns="repeat(12, 1fr)"
      gap={4}
    >
      <GridItem colSpan={3} rowSpan={5} bg={bg}>
        <PositionDetails />
      </GridItem>
      <GridItem colSpan={9} rowSpan={5} bg={bg}>
        <Statistics />
      </GridItem>
      <GridItem colSpan={12} rowSpan={7} bg={bg}>
        <TransactionHistory />
      </GridItem>
    </Grid>
  )
}
