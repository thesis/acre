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
import { acrePoints as acrePointsUtils, logPromiseFailure } from "#/utils"

const { getFormattedAmount } = acrePointsUtils

export default function AcrePointsCard(props: CardProps) {
  const {
    claimableBalance,
    nextDropTimestamp,
    totalBalance,
    handleClaim,
    updateBalance,
    updatePointsData,
  } = useAcrePoints()

  const { openModal } = useModal()

  const onClaimButtonClick = () => {
    handleClaim()
    openModal(MODAL_TYPES.ACRE_POINTS_CLAIM)
  }

  const formattedTotalPointsAmount = getFormattedAmount(totalBalance)
  const formattedClaimablePointsAmount = getFormattedAmount(claimableBalance)

  const handleOnCountdownEnd = () => {
    logPromiseFailure(updatePointsData())
    logPromiseFailure(updateBalance())
  }

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

          <VStack px={4} py={3} spacing={0} rounded="lg" bg="gold.100">
            {nextDropTimestamp && (
              <>
                <TextMd color="grey.700" textAlign="center">
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
              </>
            )}

            {claimableBalance && (
              <Button
                mt={3}
                onClick={onClaimButtonClick}
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
