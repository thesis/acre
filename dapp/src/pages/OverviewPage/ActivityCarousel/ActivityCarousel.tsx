import React, { useRef } from "react"
import Slider from "react-slick"
import { Box, BoxProps } from "@chakra-ui/react"
import { Carousel } from "#/components/shared/Carousel"
import { ActivityCard } from "#/components/shared/ActivityCard"
import { useActivities } from "#/hooks"
import { activityCarouselSettings } from "./ActivityCarouselSettings"

export function ActivityCarousel({ ...props }: BoxProps) {
  const carouselRef = useRef<HTMLInputElement & Slider>(null)
  const { activities, onRemove } = useActivities()

  const handleRemove = (txHash: string) => {
    carouselRef.current?.slickPrev()
    carouselRef.current?.forceUpdate()
    onRemove(txHash)
  }

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
            onRemove={handleRemove}
            mr={3}
          />
        ))}
      </Carousel>
    </Box>
  )
}
