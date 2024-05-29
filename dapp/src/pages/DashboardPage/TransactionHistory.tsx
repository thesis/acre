import React from "react"
import {
  StackProps,
  HStack,
  VStack,
  Card,
  CardBody,
  Box,
  Image,
  VisuallyHidden,
} from "@chakra-ui/react"
import {
  Pagination,
  PaginationButton,
  PaginationPage,
  PaginationStatus,
} from "#/components/shared/Pagination"
import { TextMd, TextSm } from "#/components/shared/Typography"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"
import emptyStateIllustration from "#/assets/images/empty-state.png"
import { displayBlockTimestamp } from "#/utils"
import { Activity } from "#/types"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"
import { IconArrowUpRight } from "@tabler/icons-react"
import { useCompletedActivities } from "#/hooks"

export default function TransactionHistory(props: StackProps) {
  const completedActivities = useCompletedActivities()

  return (
    <VStack spacing={6} w="full" {...props}>
      <TextMd fontWeight="bold" w="full">
        Transactions
      </TextMd>

      {completedActivities.length === 0 ? (
        <VStack>
          <Image src={emptyStateIllustration} alt="" opacity={0.3} />
          <TextMd color="grey.400">You have no transactions yet!</TextMd>
        </VStack>
      ) : (
        <Pagination data={completedActivities} pageSize={10}>
          <PaginationPage direction="column" spacing={2} pageSpacing={6}>
            {(pageData: Activity[]) =>
              pageData.map(({ id, timestamp, type, txHash, amount }) => (
                <Card
                  key={id}
                  role="group"
                  variant="elevated"
                  colorScheme="gold"
                >
                  <CardBody as={HStack} spacing={3} p={4}>
                    <TextSm color="grey.500" flex={1} fontWeight="medium">
                      {displayBlockTimestamp(timestamp)}
                    </TextSm>

                    <HStack flexBasis="60%">
                      <TextSm
                        color="grey.700"
                        flex={1}
                        fontWeight="semibold"
                        textTransform="capitalize"
                      >
                        {type}
                      </TextSm>

                      <Box flex={1}>
                        <CurrencyBalance
                          color="grey.700"
                          size="sm"
                          fontWeight="bold"
                          amount={amount}
                          currency="bitcoin"
                        />
                      </Box>
                    </HStack>

                    <BlockExplorerLink
                      id={txHash}
                      chain="bitcoin"
                      type="transaction"
                      variant="ghost"
                      color="grey.300"
                      _groupHover={{ color: "brand.400" }}
                      pl={6}
                      pr={4}
                      py={5}
                      mx={-4}
                      my={-5}
                    >
                      <IconArrowUpRight size={16} />
                      <VisuallyHidden>View transaction details</VisuallyHidden>
                    </BlockExplorerLink>
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
      )}
    </VStack>
  )
}
