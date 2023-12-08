import React from "react"
import {
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { USD } from "../../constants"
import { ChevronRight } from "../../static/icons"

export default function Overview() {
  const bg = useColorModeValue("white", "grey.400")
  return (
    <Flex direction="column" gap={2} p={6}>
      <Flex justifyContent="space-between">
        {/* TODO: Handle click actions */}
        <Switch size="sm">Show values in {USD.symbol}</Switch>
        <Button variant="link" rightIcon={<Icon as={ChevronRight} />}>
          Read documentation
        </Button>
      </Flex>
      <Grid
        templateAreas={`"position-details statistics"
                        "transaction-history transaction-history"`}
        gridTemplateColumns={{ base: "30% 1fr", xl: "20% 1fr" }}
        gridTemplateRows={{ base: "55% 1fr", xl: "40% 1fr" }}
        h="80vh"
        gap={4}
      >
        <GridItem bg={bg} area="position-details">
          <PositionDetails />
        </GridItem>
        <GridItem bg={bg} area="statistics">
          <Statistics />
        </GridItem>
        <GridItem bg={bg} area="transaction-history">
          <TransactionHistory />
        </GridItem>
      </Grid>
    </Flex>
  )
}
