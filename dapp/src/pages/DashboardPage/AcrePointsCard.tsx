import React from "react"
import { H4, TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  HStack,
  Icon,
  Stack,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import Countdown from "#/components/shared/Countdown"
import { logPromiseFailure, numberToLocaleString } from "#/utils"
import { useAcrePoints } from "#/hooks"
import Spinner from "#/components/shared/Spinner"
import { IconInfoCircle } from "@tabler/icons-react"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import useDebounce from "#/hooks/useDebounce"

export default function AcrePointsCard(props: CardProps) {
  const {
    claimableBalance,
    nextDropTimestamp,
    totalBalance,
    claimPoints,
    updateUserPointsData,
    updatePointsData,
    isCalculationInProgress,
  } = useAcrePoints()

  const debouncedClaimPoints = useDebounce(claimPoints, 1000)

  const formattedTotalPointsAmount = numberToLocaleString(totalBalance)
  const formattedClaimablePointsAmount = numberToLocaleString(claimableBalance)

  const handleOnCountdownEnd = () => {
    logPromiseFailure(updatePointsData())
    logPromiseFailure(updateUserPointsData())
  }

  const isDataReady =
    isCalculationInProgress || !!nextDropTimestamp || !!claimableBalance

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

          {isDataReady && (
            <VStack px={4} py={3} spacing={0} rounded="lg" bg="gold.100">
              {isCalculationInProgress ? (
                <VStack spacing={4}>
                  {!claimableBalance && (
                    <TextMd color="grey.500">Please wait...</TextMd>
                  )}

                  <HStack spacing={0}>
                    <Spinner mr={3} size="sm" />
                    <TextMd>Your drop is being prepared.</TextMd>
                    <Tooltip
                      label={`
                      We need some time to calculate your points. It may take up to 30 minutes. 
                      ${claimableBalance ? "You can still claim points from previous drops." : ""}
                    `}
                      maxW={72}
                    >
                      <Icon ml={1.5} as={IconInfoCircle} />
                    </Tooltip>
                  </HStack>
                </VStack>
              ) : (
                <Stack
                  direction={claimableBalance ? "row" : "column"}
                  spacing={0}
                >
                  <TextMd color="grey.500" textAlign="center">
                    Next drop in
                  </TextMd>
                  <Countdown
                    timestamp={nextDropTimestamp!} // Timestamp presence already checked
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
                  onClick={debouncedClaimPoints}
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
          )}
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
