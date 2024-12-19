import React from "react"
import { TextMd } from "#/components/shared/Typography"
import { HStack } from "@chakra-ui/react"
import Countdown from "#/components/shared/Countdown"
import { logPromiseFailure } from "#/utils"
import { useAcrePointsData, useUserPointsData } from "#/hooks"
import LabelWrapper from "./LabelWrapper"

export function NextDropTimestampLabel() {
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
      <TextMd color="text.tertiary" textAlign="center">
        Next drop in
      </TextMd>
      <Countdown
        timestamp={acrePointsData.nextDropTimestamp} // Timestamp presence already checked
        onCountdownEnd={handleOnCountdownEnd}
        size="md"
        ml={1}
        color="text.primary"
      />
    </HStack>
  )
}

export default function AcrePointsLabel() {
  const { data } = useAcrePointsData()

  if (!data) return null

  return (
    <LabelWrapper>
      <NextDropTimestampLabel />
    </LabelWrapper>
  )
}
