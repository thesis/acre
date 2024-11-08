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
  Image,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import Countdown from "#/components/shared/Countdown"
import { logPromiseFailure, numberToLocaleString } from "#/utils"
import { useAcrePoints, useWallet } from "#/hooks"
import Spinner from "#/components/shared/Spinner"
import { IconInfoCircle } from "@tabler/icons-react"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import InfoTooltip from "#/components/shared/InfoTooltip"
import useDebounce from "#/hooks/useDebounce"
import acrePointsIllustrationSrc from "#/assets/images/acre-points-illustration.png"

// TODO: Define colors as theme value
const COLOR_TEXT_LIGHT_PRIMARY = "#1C1A16"
const COLOR_TEXT_LIGHT_TERTIARY = "#7D6A4B"
// TODO: Update `Button` component theme
const COLOR_BUTTON_LABEL = "#FBF7EC"
const COLOR_BUTTON_BACKGROUND = "#33A321"

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
  const { isConnected } = useWallet()

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
    <Card px={4} py={5} {...props}>
      <CardHeader p={0} mb={2} as={HStack} justify="space-between">
        <TextMd fontWeight="medium" color="grey.700">
          Total Acre points
        </TextMd>

        {isConnected && (
          <InfoTooltip
            // TODO: Add alternative variant of label for disconnected wallet
            label="Your current balance of Acre points collected so far. New points drop daily and are ready to be claimed. Unclaimed points roll over to the next day."
            w={56}
          />
        )}
      </CardHeader>

      <CardBody p={0}>
        <UserDataSkeleton>
          <H4 fontWeight="semibold" mb={2}>
            {formattedTotalPointsAmount}
          </H4>
        </UserDataSkeleton>

        <Image src={acrePointsIllustrationSrc} mt={6} />

        <UserDataSkeleton>
          {isDataReady && (
            <VStack px={4} py={5} spacing={0} rounded="lg" bg="gold.100">
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
                <HStack spacing={0}>
                  <TextMd color={COLOR_TEXT_LIGHT_TERTIARY} textAlign="center">
                    Next drop in
                  </TextMd>
                  <Countdown
                    timestamp={nextDropTimestamp!} // Timestamp presence already checked
                    onCountdownEnd={handleOnCountdownEnd}
                    size="md"
                    ml={1}
                    color={COLOR_TEXT_LIGHT_PRIMARY}
                  />
                </HStack>
              )}

              {claimableBalance && (
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
              )}
            </VStack>
          )}
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
