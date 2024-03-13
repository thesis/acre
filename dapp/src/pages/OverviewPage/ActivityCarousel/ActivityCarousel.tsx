import React, { useCallback, useRef, useState } from "react"
import Slider from "react-slick"
import { Box, HStack, BoxProps } from "@chakra-ui/react"
import { ActivityCard } from "../../../components/shared/ActivityCard"
import { activityCarouselSettings } from "./utils"
import { mockedActivities } from "../../../components/shared/ActivityCard/mock-activities"

export function ActivityCarousel({ ...props }: BoxProps) {
  const sliderRef = useRef<HTMLDivElement & Slider>(null)

  // TODO: Lines 12-30 should be replaced by redux store when subgraphs are implemented
  const [activities, setActivities] = useState(mockedActivities)

  const onRemove = useCallback(
    (activityHash: string) => {
      const removedIndex = activities.findIndex(
        (activity) => activity.txHash === activityHash,
      )
      const filteredActivities = activities.filter(
        (activity) => activity.txHash !== activityHash,
      )
      const isLastCard = removedIndex === activities.length - 1
      if (isLastCard) {
        sliderRef.current?.slickPrev()
      }
      sliderRef.current?.forceUpdate()
      setActivities(filteredActivities)
    },
    [activities],
  )

  return (
    <Box pos="relative" {...props}>
      <HStack
        as={Slider}
        overflow="hidden"
        ref={sliderRef}
        pl={2}
        ml={-2}
        overflowX="hidden"
        pb={6}
        _after={{
          content: '""',
          pos: "absolute",
          right: 0,
          w: 20,
          height: 40,
          bgGradient: "linear(to-r, transparent, gold.300)",
        }}
        {...activityCarouselSettings}
      >
        {activities.map((activity) => (
          <ActivityCard
            key={activity.txHash}
            activity={activity}
            onRemove={onRemove}
            mr={3}
          />
        ))}
      </HStack>
    </Box>
  )
}
