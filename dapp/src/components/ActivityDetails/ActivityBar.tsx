import React, { useCallback, useState } from "react"
import { Link as ReactRouterLink } from "react-router-dom"
import { Flex, Link as ChakraLink } from "@chakra-ui/react"
import ActivityCard from "./ActivityCard"
import { mockedTransactions } from "./mock-transactions"

type ActivityBarType = {
  flexDirection?: React.CSSProperties["flexDirection"]
}

function ActivityBar({ flexDirection = "row" }: ActivityBarType) {
  const [transactions, setTransactions] = useState(mockedTransactions)

  const onRemove = useCallback(
    (transactionHash: string) => {
      const filteredTransactions = transactions.filter(
        (transaction) => transaction.receiptTx.txHash !== transactionHash,
      )
      setTransactions(filteredTransactions)
    },
    [transactions],
  )
  return (
    <Flex flexDirection={flexDirection} gap={3}>
      {transactions.map((transaction) => (
        <ChakraLink
          as={ReactRouterLink}
          to="/activity-details"
          state={{ transaction }}
        >
          <ActivityCard
            key={transaction.receiptTx.txHash}
            transaction={transaction}
            onRemove={onRemove}
          />
        </ChakraLink>
      ))}
    </Flex>
  )
}

export default ActivityBar
