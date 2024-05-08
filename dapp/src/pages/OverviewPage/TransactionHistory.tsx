import React from "react"
import {
  StackProps,
  HStack,
  VStack,
  Card,
  CardBody,
  IconButton,
  Icon,
  Link,
  Box,
} from "@chakra-ui/react"
import {
  Pagination,
  PaginationButton,
  PaginationPage,
  PaginationStatus,
} from "#/components/shared/Pagination"
import { TextMd, TextSm } from "#/components/shared/Typography"
import { IconArrowUpRight } from "@tabler/icons-react"
import { CurrencyBalance } from "#/components/shared/CurrencyBalance"

// TODO: Fix `Pagination` container height transition

const MOCK_DATA = [
  {
    date: "2 mins ago",
    type: "Deposit",
    amount: 499000000,
    address: "1Lbcfr7sA.....8LK4ZnX71",
    transactionUrl: "",
  },
  {
    date: "3 hours ago",
    type: "Withdraw",
    amount: 499000000,
    address: "1Lbcfr7sA.....8LK4ZnX71",
    transactionUrl: "",
  },
  Array(16).fill({
    date: "23/11/2023, 12:01",
    type: "Deposit",
    amount: 499000000,
    address: "1Lbcfr7sA.....8LK4ZnX71",
    transactionUrl: "",
  }),
].flat()

export default function TransactionHistory(props: StackProps) {
  return (
    <VStack spacing={6} align="start" {...props}>
      <TextMd fontWeight="bold">Transactions</TextMd>

      <Pagination data={MOCK_DATA} pageSize={10} dataLabel="transactions">
        <PaginationPage direction="column" spacing={2}>
          {(pageData) =>
            // TODO: Fix type assertion of `pageData`
            (pageData as typeof MOCK_DATA).map(
              ({ date, type, amount, address, url }) => (
                <Card role="group" variant="elevated" colorScheme="gold">
                  <CardBody as={HStack} spacing={0} p={4}>
                    <TextSm color="grey.500" flex={1}>
                      {date}
                    </TextSm>

                    <HStack flexBasis="72%" spacing={0}>
                      <TextSm color="grey.700" flex={1} fontWeight="medium">
                        {type}
                      </TextSm>
                      <Box flex={1}>
                        <CurrencyBalance
                          color="grey.700"
                          fontWeight="bold"
                          amount={amount as string}
                          currency="bitcoin"
                        />
                      </Box>
                      <TextSm color="grey.500" flexBasis="50%">
                        {address}
                      </TextSm>
                    </HStack>

                    <IconButton
                      as={Link}
                      icon={<Icon boxSize={4} as={IconArrowUpRight} />}
                      aria-label="View transaction details"
                      href={url as string}
                      variant="ghost"
                      color="grey.300"
                      _groupHover={{ color: "brand.400" }}
                      pl={6}
                      pr={4}
                      m={-4}
                    />
                  </CardBody>
                </Card>
              ),
            )
          }
        </PaginationPage>

        <HStack spacing={2}>
          <HStack spacing={2}>
            <PaginationButton mode="previous" />
            <PaginationButton mode="next" />
          </HStack>

          <PaginationStatus color="grey.500" />
        </HStack>
      </Pagination>
    </VStack>
  )
}
