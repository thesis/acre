import React from "react"
import { HStack, Card, CardBody, Box, Flex, Text } from "@chakra-ui/react"
import {
  Pagination,
  PaginationButton,
  PaginationFooter,
  PaginationPage,
  PaginationStatus,
} from "#/components/shared/Pagination"
import CurrencyBalance from "#/components/shared/CurrencyBalance"
import { timeUtils, activitiesUtils } from "#/utils"
import { Activity } from "#/types"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"
import { useActivities, useMobileMode } from "#/hooks"
import { semanticTokens } from "#/theme/utils"
import EstimatedDuration from "./EstimatedDuration"

const BLOCK_EXPLORER_CELL_MIN_WIDTH = 16

export default function TransactionTable() {
  const { data } = useActivities()
  const isMobileMode = useMobileMode()

  return (
    <Pagination data={data ?? []} pageSize={isMobileMode ? 5 : 10} spacing={6}>
      <PaginationPage direction="column" spacing={2} pageSpacing={6}>
        {(pageData: Activity[]) =>
          pageData.map((activity) => (
            <Card
              key={activity.id}
              role="group"
              bg="surface.2"
              p={4}
              borderRadius="sm"
            >
              <CardBody as={Flex} flexDirection="column" gap={4}>
                <Flex flexDirection="column">
                  <Flex justifyContent="space-between">
                    <Text
                      size="sm"
                      color="text.primary"
                      flex={1}
                      fontWeight="semibold"
                      textTransform="capitalize"
                    >
                      {activity.type}
                    </Text>
                    <CurrencyBalance
                      color="text.primary"
                      size="sm"
                      fontWeight="bold"
                      amount={activity.amount}
                      currency="bitcoin"
                      withDots
                      withTooltip
                    />
                  </Flex>
                  <Flex justifyContent="space-between">
                    <Text size="sm" color="text.tertiary" flex={1}>
                      {timeUtils.displayBlockTimestamp(
                        activitiesUtils.getActivityTimestamp(activity),
                      )}
                    </Text>
                    {activity.txHash ? (
                      <BlockExplorerLink
                        id={activity.txHash}
                        chain="bitcoin"
                        type="transaction"
                        text="Details"
                        minW={BLOCK_EXPLORER_CELL_MIN_WIDTH}
                      />
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

        <PaginationStatus dataLabel="entries" color="text.tertiary" />
      </PaginationFooter>
    </Pagination>
  )
}
