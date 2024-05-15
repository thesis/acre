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
import emptyStateIlustration from "#/assets/images/empty-state.png"
import { ArrowUpRightAnimatedIcon } from "#/assets/icons/animated"
import { motion } from "framer-motion"
import { displayBlockTimestamp, truncateAddress } from "#/utils"
import { useActivitiesNEW as useActivities } from "#/hooks"
import { Activity } from "#/types"
import BlockExplorerLink from "#/components/shared/BlockExplorerLink"

type TransactionHistoryData = {
  date: number
  type: string
  amount: string
  address: string
  url: string
}[]

type TransactionHistoryProps = StackProps & {
  data?: TransactionHistoryData
}

export default function TransactionHistory(props: TransactionHistoryProps) {
  const activities = useActivities()

  const completedActivities = React.useMemo(
    () => activities.filter(({ status }) => status === "completed"),
    [activities],
  )

  return (
    <VStack spacing={6} w="full" {...props}>
      <TextMd fontWeight="bold" w="full">
        Transactions
      </TextMd>

      {completedActivities.length === 0 ? (
        <VStack>
          <Image src={emptyStateIlustration} alt="" opacity={0.3} />
          <TextMd color="grey.400">You have no transactions yet!</TextMd>
        </VStack>
      ) : (
        <Pagination data={completedActivities} pageSize={10}>
          <PaginationPage direction="column" spacing={2} pageSpacing={6}>
            {(pageData: Activity[]) =>
              pageData.map(({ id, timestamp, type, txHash, amount }) => (
                <Card
                  as={motion.div}
                  initial={false}
                  whileHover="animate"
                  key={id}
                  role="group"
                  variant="elevated"
                  colorScheme="gold"
                >
                  <CardBody as={HStack} spacing={0} p={4}>
                    <TextSm color="grey.500" flex={1}>
                      {displayBlockTimestamp(timestamp)}
                    </TextSm>

                    <HStack flexBasis="72%" spacing={0}>
                      <TextSm color="grey.700" flex={1} fontWeight="medium">
                        {type}
                      </TextSm>
                      <Box flex={1}>
                        <CurrencyBalance
                          color="grey.700"
                          fontWeight="bold"
                          amount={amount}
                          currency="bitcoin"
                        />
                      </Box>
                      <TextSm color="grey.500" flexBasis="50%">
                        {truncateAddress(txHash)}
                      </TextSm>
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
                      m={-4}
                    >
                      <ArrowUpRightAnimatedIcon />
                      <VisuallyHidden>View transaction details</VisuallyHidden>
                    </BlockExplorerLink>
                  </CardBody>
                </Card>
              ))
            }
          </PaginationPage>

          <HStack
            spacing={2}
            m={-5}
            mt={-6}
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
