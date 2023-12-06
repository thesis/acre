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
    </Flex>
  )
}
