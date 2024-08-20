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

export default function AcrePointsCard(props: CardProps) {
  const { data, formatted } = useAcrePoints()
  const { openModal } = useModal()

  const handleClaim = () => {
    // TODO: Call API endpoint to claim points
    openModal(MODAL_TYPES.ACRE_POINTS_CLAIM)
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
          <H4 mb={2}>{formatted.totalPointsAmount}&nbsp;PTS</H4>
          <TextMd color="grey.500" mb={4}>
            + {formatted.dailyPointsAmount} PTS/day
          </TextMd>

          <VStack px={4} py={3} spacing={3} rounded="lg" bg="gold.100">
            <TextMd color="grey.700" textAlign="center">
              Next drop in
              <Countdown
                timestamp={data.nextDropTimestamp}
                size={data.claimablePointsAmount ? "md" : "2xl"}
                display={data.claimablePointsAmount ? "inline" : "block"}
                ml={data.claimablePointsAmount ? 2 : 0}
                mt={data.claimablePointsAmount ? 0 : 2}
              />
            </TextMd>

            {data.claimablePointsAmount && (
              <Button
                onClick={handleClaim}
                w="full"
                colorScheme="green"
                color="gold.200"
                fontWeight="bold"
                size="lg"
              >
                Claim {formatted.claimablePointsAmount} PTS
              </Button>
            )}
          </VStack>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
