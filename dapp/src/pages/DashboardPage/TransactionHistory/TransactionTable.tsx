import React from "react"
import { HStack, Card, CardBody, Box, Flex, Icon } from "@chakra-ui/react"
import {
  Pagination,
  PaginationButton,
  PaginationPage,
  PaginationStatus,
} from "#/components/shared/Pagination"
import { TextSm } from "#/components/shared/Typography"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { displayBlockTimestamp } from "#/utils"
import { Activity } from "#/types"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"
import { IconArrowUpRight } from "@tabler/icons-react"
import { useActivities } from "#/hooks"
import EstimatedDuration from "./EstimatedDuration"

export default function TransactionTable() {
  const activities = useActivities()

  return (
    <Pagination data={activities} pageSize={10}>
      <PaginationPage direction="column" spacing={2} pageSpacing={6}>
        {(pageData: Activity[]) =>
          pageData.map((activity) => (
            <Card
              key={activity.id}
              role="group"
              variant="elevated"
              colorScheme="gold"
            >
              <CardBody as={Flex} flexDirection="column" gap={4} p={4}>
                <HStack spacing={3}>
                  <TextSm color="grey.500" flex={1} fontWeight="medium">
                    {displayBlockTimestamp(
                      activity?.finalizedAt ?? activity.initializedAt,
                    )}
                  </TextSm>

                  <HStack flexBasis="60%">
                    <TextSm
                      color="grey.700"
                      flex={1}
                      fontWeight="semibold"
                      textTransform="capitalize"
                    >
                      {activity.type}
                    </TextSm>

                    <Box flex={1}>
                      <CurrencyBalance
                        color="grey.700"
                        size="sm"
                        fontWeight="bold"
                        amount={activity.amount}
                        currency="bitcoin"
                        withDots
                      />
                    </Box>
                  </HStack>
                  {activity.txHash && (
                    <BlockExplorerLink
                      id={activity.txHash}
                      chain="bitcoin"
                      type="transaction"
                      color="grey.600"
                      _groupHover={{
                        color: "brand.400",
                        textDecoration: "none",
                      }}
                    >
                      <HStack spacing={1}>
                        <TextSm>Details</TextSm>
                        <Icon
                          as={IconArrowUpRight}
                          color="brand.400"
                          boxSize={4}
                        />
                      </HStack>
                    </BlockExplorerLink>
                  )}
                </HStack>
                <EstimatedDuration activity={activity} />
              </CardBody>
            </Card>
          ))
        }
      </PaginationPage>

      <HStack
        spacing={2}
        mx={-5}
        mt={-6}
        mb={-10}
        p={5}
        pt={6}
        bgGradient="linear(to-b, transparent, gold.200 20%)"
        zIndex={2}
      >
        <HStack spacing={2}>
          <PaginationButton mode="previous" />
          <PaginationButton mode="next" />
        </HStack>

        <PaginationStatus dataLabel="transactions" color="grey.500" />
      </HStack>
    </Pagination>
  )
}
