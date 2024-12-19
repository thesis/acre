import React from "react"
import { ActivityType } from "#/types"
import { activitiesUtils } from "#/utils"
import { useFormField } from "#/hooks"
import { TextMd } from "../shared/Typography"
import { TOKEN_AMOUNT_FIELD_NAME } from "../shared/TokenAmountForm/TokenAmountFormBase"

export default function ActionDurationEstimation({
  type,
}: {
  type: ActivityType
}) {
  const { value: amount = 0n } = useFormField<bigint | undefined>(
    TOKEN_AMOUNT_FIELD_NAME,
  )

  return (
    <TextMd mt={4} color="grey.400">
      Estimated duration&nbsp;
      <TextMd as="span" color="grey.500">
        ~ {activitiesUtils.getEstimatedDuration(amount, type)}
      </TextMd>
    </TextMd>
  )
}
