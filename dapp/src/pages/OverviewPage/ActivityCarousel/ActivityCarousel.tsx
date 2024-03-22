import React, { useRef, useCallback } from "react"
import Slider from "react-slick"
import { Box, BoxProps } from "@chakra-ui/react"
import { Carousel } from "#/components/shared/Carousel"
import { ActivityCard } from "#/components/shared/ActivityCard"
import { useActivities } from "#/hooks"
import { ActivityInfo } from "#/types"
import { activityCarouselSettings } from "./ActivityCarouselSettings"

export function ActivityCarousel({ ...props }: BoxProps) {
  const carouselRef = useRef<HTMLInputElement & Slider>(null)
  const { activities, removeActivity } = useActivities()

  const handleRemove = useCallback(
    (activity: ActivityInfo) => {
      carouselRef.current?.slickPrev()
      carouselRef.current?.forceUpdate()
      removeActivity(activity)
    },
    [removeActivity],
  )

  return (
    <Box pos="relative" {...props}>
      <Carousel
        overflow="hidden"
        ref={carouselRef}
        pl={2}
        ml={-2}
        overflowX="hidden"
        pb={6}
        _after={{
          content: '""',
          pos: "absolute",
          right: 0,
          w: 8,
          height: 40,
          bgGradient: "linear(to-r, transparent, gold.300)",
        }}
        {...activityCarouselSettings}
      >
        {activities.map((activity) => (
          <ActivityCard
            key={activity.txHash}
            activity={activity}
            onRemove={handleRemove}
            mr={3}
          />
        ))}
      </Carousel>
    </Box>
  )
}
