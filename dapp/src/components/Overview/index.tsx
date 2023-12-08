import React from "react"
import {
  Button,
  Flex,
  Grid,
  Icon,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react"
import PositionDetails from "./PositionDetails"
import Statistics from "./Statistics"
import TransactionHistory from "./TransactionHistory"
import { USD } from "../../constants"
import { ChevronRight } from "../../static/icons"
import { useDocsDrawer } from "../../hooks"

export default function Overview() {
  const { onOpen } = useDocsDrawer()

  const bg = useColorModeValue("white", "grey.400")

  return (
    <Flex direction="column" gap={2} p={6}>
      <Flex justifyContent="space-between">
        {/* TODO: Handle click actions */}
        <Switch size="sm">Show values in {USD.symbol}</Switch>
        <Button
          variant="link"
          rightIcon={<Icon as={ChevronRight} />}
          onClick={onOpen}
        >
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
        <PositionDetails bg={bg} gridArea="position-details" />
        <Statistics bg={bg} gridArea="statistics" />
        <TransactionHistory bg={bg} gridArea="transaction-history" />
      </Grid>
    </Flex>
  )
}
