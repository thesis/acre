import React from "react"
import { TextMd } from "#/components/shared/Typography"
import { Button, HStack, VStack } from "@chakra-ui/react"
import Countdown from "#/components/shared/Countdown"
import { logPromiseFailure, numberToLocaleString } from "#/utils"
import {
  useAcrePointsData,
  useClaimPoints,
  useUserPointsData,
  useWallet,
} from "#/hooks"
import Spinner from "#/components/shared/Spinner"
import TooltipIcon from "#/components/shared/TooltipIcon"
import useDebounce from "#/hooks/useDebounce"
import { ONE_SEC_IN_MILLISECONDS } from "#/constants"

// TODO: Define colors as theme value
const COLOR_TEXT_LIGHT_PRIMARY = "#1C1A16"
const COLOR_TEXT_LIGHT_TERTIARY = "#7D6A4B"
// TODO: Update `Button` component theme
const COLOR_BUTTON_LABEL = "#FBF7EC"
const COLOR_BUTTON_BACKGROUND = "#33A321"

function NextDropTimestampLabel() {
  const { data: acrePointsData, refetch: acrePointsDataRefetch } =
    useAcrePointsData()
  const { refetch: userPointsDataRefetch } = useUserPointsData()

  const handleOnCountdownEnd = () => {
    logPromiseFailure(acrePointsDataRefetch())
    logPromiseFailure(userPointsDataRefetch())
  }

  if (!acrePointsData?.nextDropTimestamp) return null

  return (
    <HStack spacing={0}>
      <TextMd color={COLOR_TEXT_LIGHT_TERTIARY} textAlign="center">
        Next drop in
      </TextMd>
      <Countdown
        timestamp={acrePointsData.nextDropTimestamp} // Timestamp presence already checked
        onCountdownEnd={handleOnCountdownEnd}
        size="md"
        ml={1}
        color={COLOR_TEXT_LIGHT_PRIMARY}
      />
    </HStack>
  )
}

function ClaimableBalanceLabel() {
  const { mutate: claimPoints } = useClaimPoints()
  const { data: userPointsData } = useUserPointsData()
  const debouncedClaimPoints = useDebounce(claimPoints, ONE_SEC_IN_MILLISECONDS)

  const claimableBalance = userPointsData?.claimableBalance || 0
  const formattedClaimablePointsAmount = numberToLocaleString(claimableBalance)

  if (claimableBalance <= 0) return null

  return (
    <Button
      mt={5}
      onClick={debouncedClaimPoints}
      w="full"
      colorScheme="green"
      bgColor={COLOR_BUTTON_BACKGROUND}
      color={COLOR_BUTTON_LABEL}
      fontWeight="semibold"
      size="lg"
    >
      Claim {formattedClaimablePointsAmount} PTS
    </Button>
  )
}

function CalculationInProgressLabel() {
  const { data } = useUserPointsData()

  return (
    <VStack spacing={4}>
      {!data?.claimableBalance && (
        <TextMd color="grey.500">Please wait...</TextMd>
      )}
      <HStack spacing={0}>
        <Spinner mr={3} size="sm" />
        <TextMd>Your drop is being prepared.</TextMd>
        <TooltipIcon
          label={`
            We need some time to calculate your points. It may take up to 30 minutes. 
            ${data?.claimableBalance ? "You can still claim points from previous drops." : ""}
          `}
          maxW={72}
        />
      </HStack>
    </VStack>
  )
}

export default function AcrePointsLabel() {
  const { data } = useAcrePointsData()
  const { isConnected } = useWallet()

  if (!isConnected) return <NextDropTimestampLabel />

  if (data?.isCalculationInProgress)
    return (
      <>
        <CalculationInProgressLabel />
        <ClaimableBalanceLabel />
      </>
    )

  return (
    <>
      <NextDropTimestampLabel />
      <ClaimableBalanceLabel />
    </>
  )
}
