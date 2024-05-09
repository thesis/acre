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
  Image,
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
import emptyStateIlustration from "#/assets/images/empty-state.png"
import { ArrowUpRightAnimatedIcon } from "#/assets/icons/animated"
import { motion } from "framer-motion"

// TODO: Fix `Pagination` container height transition

type TransactionHistoryProps = StackProps & {
  data?: {
    date: string
    type: string
    amount: string
    address: string
    url: string
  }[]
}

export default function TransactionHistory(props: TransactionHistoryProps) {
  const { data = [], ...restProps } = props

  return (
    <VStack spacing={6} {...restProps}>
      <TextMd fontWeight="bold" w="full">
        Transactions
      </TextMd>

      {data.length === 0 ? (
        <VStack>
          <Image src={emptyStateIlustration} alt="" opacity={0.3} />
          <TextMd color="grey.400">You have no transactions yet!</TextMd>
        </VStack>
      ) : (
        <Pagination data={data} pageSize={10}>
          <PaginationPage direction="column" spacing={2} pageSpacing={6}>
            {(pageData) =>
              // TODO: Fix type assertion of `pageData`
              (pageData as typeof data).map(
                ({ date, type, amount, address, url }) => (
                  <Card
                    as={motion.div}
                    initial={false}
                    whileHover="animate"
                    key={url}
                    role="group"
                    variant="elevated"
                    colorScheme="gold"
                  >
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
                            amount={amount}
                            currency="bitcoin"
                          />
                        </Box>
                        <TextSm color="grey.500" flexBasis="50%">
                          {address}
                        </TextSm>
                      </HStack>

                      <IconButton
                        as={Link}
                        icon={<ArrowUpRightAnimatedIcon top={1} />}
                        aria-label="View transaction details"
                        href={url}
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
