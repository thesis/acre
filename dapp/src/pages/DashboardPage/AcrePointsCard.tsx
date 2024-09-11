import React from "react"
import { H4, TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  VStack,
} from "@chakra-ui/react"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import Countdown from "#/components/shared/Countdown"
import useAcrePoints from "#/hooks/useAcrePoints"
import { MODAL_TYPES } from "#/types"
import { useModal } from "#/hooks"
import { acrePoints as acrePointsUtils } from "#/utils"

const { getFormattedAmount } = acrePointsUtils

export default function AcrePointsCard(props: CardProps) {
  const {
    claimablePointsAmount,
    nextDropTimestamp,
    totalPointsAmount,
    dailyPointsAmount,
  } = useAcrePoints()

  const { openModal } = useModal()

  const handleClaim = () => {
    // TODO: Call API endpoint to claim points
    openModal(MODAL_TYPES.ACRE_POINTS_CLAIM)
  }

  const formattedTotalPointsAmount = getFormattedAmount(totalPointsAmount)
  const formattedDailyPointsAmount = getFormattedAmount(dailyPointsAmount)
  const formattedClaimablePointsAmount = getFormattedAmount(
    claimablePointsAmount,
  )

  return (
    <Card
      px="1.875rem" // 30px
      py={5}
      {...props}
    >
      <CardHeader p={0} mb={2}>
        <TextMd fontWeight="bold" color="grey.700">
          Acre points balance
        </TextMd>
      </CardHeader>

      <CardBody p={0}>
        <UserDataSkeleton>
          <H4 mb={2}>{formattedTotalPointsAmount}&nbsp;PTS</H4>
          <TextMd color="grey.500" mb={4}>
            + {formattedDailyPointsAmount} PTS/day
          </TextMd>

          <VStack px={4} py={3} spacing={3} rounded="lg" bg="gold.100">
            <TextMd color="grey.700" textAlign="center">
              Next drop in
              <Countdown
                timestamp={nextDropTimestamp}
                size={claimablePointsAmount ? "md" : "2xl"}
                display={claimablePointsAmount ? "inline" : "block"}
                ml={claimablePointsAmount ? 2 : 0}
                mt={claimablePointsAmount ? 0 : 2}
              />
            </TextMd>

            {claimablePointsAmount && (
              <Button
                onClick={handleClaim}
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
