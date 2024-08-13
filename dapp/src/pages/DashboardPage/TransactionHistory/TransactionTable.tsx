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
import { displayBlockTimestamp } from "#/utils"
import { Activity } from "#/types"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"
import { IconArrowUpRight } from "@tabler/icons-react"
import { useActivities } from "#/hooks"
import { semanticTokens } from "#/theme/utils"
import EstimatedDuration from "./EstimatedDuration"

export default function TransactionTable() {
  const activities = useActivities()

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
