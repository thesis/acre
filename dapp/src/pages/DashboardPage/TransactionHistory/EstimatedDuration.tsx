import React from "react"
import { Box, Tag, TagLabel, Flex, TagLeftIcon } from "@chakra-ui/react"
import Spinner from "#/components/shared/Spinner"
import { activitiesUtils } from "#/utils"
import { Activity } from "#/types"

export default function EstimatedDuration({
  activity,
}: {
  activity: Activity
}) {
  if (activitiesUtils.isActivityCompleted(activity)) return null

  return (
    <Flex gap={3} flexWrap="wrap">
      <Tag variant="solid">
        <TagLeftIcon
          as={Spinner}
          mr={2}
          borderWidth={3}
          boxSize={6}
          color="gold.400"
          emptyColor="brand.400"
        />
        <TagLabel>In progress...</TagLabel>
      </Tag>
      <Tag variant="solid">
        <TagLabel display="flex" gap={1}>
          Est. duration
          <Box as="span" color="brand.400">
            {activitiesUtils.getEstimatedDuration(
              activity.amount,
              activity.type,
            )}
          </Box>
        </TagLabel>
      </Tag>
    </Flex>
  )
}
