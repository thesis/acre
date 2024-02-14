import React, { useCallback, useState } from "react"
import { Link as ReactRouterLink } from "react-router-dom"
import { Flex, Link as ChakraLink, FlexboxProps } from "@chakra-ui/react"
import ActivityCard from "./ActivityCard"
import { mockedTransactions } from "./mock-transactions"

function ActivityBar(props: FlexboxProps) {
  const [transactions, setTransactions] = useState(mockedTransactions)

  const onRemove = useCallback(
    (transactionHash: string) => {
      const filteredTransactions = transactions.filter(
        (transaction) => transaction.txHash !== transactionHash,
      )
      setTransactions(filteredTransactions)
    },
    [transactions],
  )
  return (
    <Flex gap={3} {...props}>
      {transactions.map((transaction) => (
        <ChakraLink
          as={ReactRouterLink}
          to="/activity-details"
          state={{ transaction }}
          key={transaction.txHash}
        >
          <ActivityCard transaction={transaction} onRemove={onRemove} />
        </ChakraLink>
      ))}
    </Flex>
  )
}

export default ActivityBar
