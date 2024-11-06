import React from "react"
import { HStack, Card, CardBody, Box, Flex, Icon } from "@chakra-ui/react"
import {
  Pagination,
  PaginationButton,
  PaginationFooter,
  PaginationPage,
  PaginationStatus,
} from "#/components/shared/Pagination"
import { TextSm } from "#/components/shared/Typography"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import { displayBlockTimestamp, getActivityTimestamp } from "#/utils"
import { Activity } from "#/types"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"
import { IconArrowUpRight } from "@tabler/icons-react"
import { useActivities } from "#/hooks"
import { semanticTokens } from "#/theme/utils"
import EstimatedDuration from "./EstimatedDuration"
import { createActivity } from "#/tests/factories"

const BLOCK_EXPLORER_CELL_MIN_WIDTH = 16

export default function TransactionTable() {
  // const activities = useActivities()
  const activities = [
    createActivity({
      amount: 122200000n,
    }),
  ]

  return (
    <Pagination data={activities} pageSize={10} spacing={6}>
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
                <Flex flexDirection="column">
                  <Flex justifyContent="space-between">
                    <TextSm
                      color="grey.700"
                      flex={1}
                      fontWeight="semibold"
                      textTransform="capitalize"
                    >
                      {activity.type}
                    </TextSm>
                    <CurrencyBalance
                      color="grey.700"
                      size="sm"
                      fontWeight="bold"
                      amount={activity.amount}
                      currency="bitcoin"
                      withDots
                      withTooltip
                    />
                  </Flex>
                  <Flex justifyContent="space-between">
                    <TextSm color="grey.500" flex={1} fontWeight="medium">
                      {displayBlockTimestamp(getActivityTimestamp(activity))}
                    </TextSm>
                    {activity.txHash ? (
                      <BlockExplorerLink
                        id={activity.txHash}
                        chain="bitcoin"
                        type="transaction"
                        color="grey.600"
                        _groupHover={{
                          color: "brand.400",
                          textDecoration: "none",
                        }}
                        minW={BLOCK_EXPLORER_CELL_MIN_WIDTH}
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
                    ) : (
                      <Box minW={BLOCK_EXPLORER_CELL_MIN_WIDTH} />
                    )}
                  </Flex>
                </Flex>
                <EstimatedDuration activity={activity} />
              </CardBody>
            </Card>
          ))
        }
      </PaginationPage>

      <PaginationFooter
        spacing={2}
        // TODO: Temporary solution - Animation should be fixed in such a way
        // that it does not affect other elements. Currently, when we add some
        // new element under the `PaginationPage` or `Pagination` tag,
        // the list of activities will overlap it when we switch pages.
        //
        // The `containerPadding` property does not solve the problem
        // but hides it for the `PaginationFooter` component.
        containerPadding={semanticTokens.space.dashboard_card_padding}
      >
        <HStack spacing={2}>
          <PaginationButton mode="previous" />
          <PaginationButton mode="next" />
        </HStack>

        <PaginationStatus dataLabel="transactions" color="grey.500" />
      </PaginationFooter>
    </Pagination>
  )
}
