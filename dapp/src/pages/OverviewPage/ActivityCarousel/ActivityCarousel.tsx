import React, { useRef, useCallback } from "react"
import Slider from "react-slick"
import { Box, BoxProps } from "@chakra-ui/react"
import { Carousel } from "#/components/shared/Carousel"
import { ActivityCard } from "#/components/shared/ActivityCard"
import { useActivities } from "#/hooks"
import { ActivityInfo } from "#/types"
import { activityCarouselSettings } from "./settings"

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
        ref={carouselRef}
        // pl={2} & ml={-2} props are required to show not-cut left shadow
        // below the first card in the carousel.
        pl={2}
        ml={-2}
        // pb={6} is required to show bottom shadow below cards in the carousel.
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
          />
        ))}
      </Carousel>
    </Box>
  )
}
