import React from "react"
import { ActivityType } from "#/types"
import { getEstimatedDuration } from "#/utils"
import { TextMd } from "../shared/Typography"
import { useTokenAmountField } from "../shared/TokenAmountForm/TokenAmountFormBase"

export default function ActionDurationEstimation({
  type,
}: {
  type: ActivityType
}) {
  const { value: amount } = useTokenAmountField()

  return (
    <TextMd mt={4} color="grey.500">
      Estimated duration&nbsp;
      <TextMd as="span" color="grey.700">
        ~ {getEstimatedDuration(amount ?? 0n, type)}
      </TextMd>
    </TextMd>
  )
}
