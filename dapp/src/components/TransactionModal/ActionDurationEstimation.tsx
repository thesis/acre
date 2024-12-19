import React from "react"
import { ActivityType } from "#/types"
import { activitiesUtils } from "#/utils"
import { useFormField } from "#/hooks"
import { Text } from "@chakra-ui/react"
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
    <Text size="md" mt={4} color="grey.400">
      Estimated duration&nbsp;
      <Text size="md" as="span" color="grey.500">
        ~ {activitiesUtils.getEstimatedDuration(amount, type)}
      </Text>
    </Text>
  )
}
