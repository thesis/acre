import React from "react"
import { H4, TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Stack,
  VStack,
} from "@chakra-ui/react"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import Countdown from "#/components/shared/Countdown"
import { logPromiseFailure, numberToLocaleString } from "#/utils"
import { useAcrePoints } from "#/hooks"

export default function AcrePointsCard(props: CardProps) {
  const {
    claimableBalance,
    nextDropTimestamp,
    totalBalance,
    claimPoints,
    updateUserPointsData,
    updatePointsData,
  } = useAcrePoints()

  const formattedTotalPointsAmount = numberToLocaleString(totalBalance)
  const formattedClaimablePointsAmount = numberToLocaleString(claimableBalance)

  const handleOnCountdownEnd = () => {
    logPromiseFailure(updatePointsData())
    logPromiseFailure(updateUserPointsData())
  }

  return (
    <Card
      px="1.875rem" // 30px
      py={5}
      {...props}
    >
      <CardHeader p={0} mb={2}>
        <TextMd fontWeight="bold" color="grey.700">
          Your Acre points balance
        </TextMd>
      </CardHeader>

      <CardBody p={0}>
        <UserDataSkeleton>
          <H4 mb={2}>{formattedTotalPointsAmount}&nbsp;PTS</H4>

          <VStack px={4} py={3} spacing={0} rounded="lg" bg="gold.100">
            {nextDropTimestamp && (
              <Stack
                direction={claimableBalance ? "row" : "column"}
                spacing={0}
              >
                <TextMd color="grey.500" textAlign="center">
                  Next drop in
                </TextMd>
                <Countdown
                  timestamp={nextDropTimestamp}
                  onCountdownEnd={handleOnCountdownEnd}
                  size={claimableBalance ? "md" : "2xl"}
                  display={claimableBalance ? "inline" : "block"}
                  ml={claimableBalance ? 2 : 0}
                  mt={claimableBalance ? 0 : 2}
                />
              </Stack>
            )}

            {claimableBalance && (
              <Button
                mt={3}
                onClick={claimPoints}
                w="full"
                colorScheme="green"
                color="gold.200"
                fontWeight="bold"
                size="lg"
              >
                Claim {formattedClaimablePointsAmount} PTS
              </Button>
            )}
          </VStack>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
