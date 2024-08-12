import React from "react"
import { HStack, Box, Tag, TagLabel } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { isActivityCompleted, staking } from "#/utils"
import { Activity } from "#/types"

export default function EstimatedDuration({
  activity,
}: {
  activity: Activity
}) {
  if (isActivityCompleted(activity)) return null

  return (
    <HStack spacing={3}>
      <Tag variant="solid">
        <Spinner
          borderWidth={3}
          boxSize={6}
          mr={2}
          color="gold.400"
          emptyColor="brand.400"
        />
        <TagLabel>{`${staking.convertActivityTypeToLabel(activity.type)} transaction pending...`}</TagLabel>
      </Tag>
      <Tag variant="solid">
        <TagLabel display="flex" gap={1}>
          Est. duration
          <Box as="span" color="brand.400">
            {staking.getEstimatedDuration(activity.amount, activity.type)}
          </Box>
        </TagLabel>
      </Tag>
    </HStack>
  )
}
