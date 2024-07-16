import React from "react"
import { StackProps, VStack, Image } from "@chakra-ui/react"
import { TextMd } from "#/components/shared/Typography"
import { useCompletedActivities, useIsSignedMessage } from "#/hooks"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import emptyStateIllustration from "#/assets/images/empty-state.png"
import TransactionTable from "./TransactionTable"

function TransactionHistoryContent() {
  const completedActivities = useCompletedActivities()
  const isSignedMessage = useIsSignedMessage()

  if (!isSignedMessage)
    return (
      <VStack w="100%" spacing={2}>
        {[...Array(3).keys()].map((key) => (
          <UserDataSkeleton key={key} height={8} w="100%" />
        ))}
      </VStack>
    )

  if (completedActivities.length === 0)
    return (
      <VStack w="100%">
        <Image src={emptyStateIllustration} alt="" opacity={0.3} />,
        <TextMd color="grey.400">You have no transactions yet!</TextMd>
      </VStack>
    )

  return <TransactionTable />
}

export default function TransactionHistory(props: StackProps) {
  return (
    <VStack spacing={6} w="full" {...props}>
      <TextMd fontWeight="bold" w="full">
        Transactions
      </TextMd>
      <TransactionHistoryContent />
    </VStack>
  )
}
