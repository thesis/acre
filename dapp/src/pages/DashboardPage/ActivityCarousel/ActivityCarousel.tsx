import React, { useRef, useCallback } from "react"
import Slider from "react-slick"
import { Box, BoxProps } from "@chakra-ui/react"
import { Carousel } from "#/components/shared/Carousel"
import { ActivityCard } from "#/components/shared/ActivityCard"
import { useActivities } from "#/hooks"
import { ActivityInfo } from "#/types"
import { NextArrowCarousel, PrevArrowCarousel } from "./ActivityCarouselArrows"

/* *
 * Settings for react-slick carousel.
 * Breakpoints are calculated based on with & visibility of activity card.
 * slidesToShow attr is needed to correctly display the number of cards in the carousel
 * and it depends on the width of the viewport.
 * */
export const activityCarouselSettings = {
  nextArrow: <NextArrowCarousel />,
  prevArrow: <PrevArrowCarousel />,
  responsive: [
    {
      breakpoint: 820,
      settings: {
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 1080,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 1360,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 1620,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 1900,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 2160,
      settings: {
        slidesToShow: 6,
      },
    },
    {
      breakpoint: 2440,
      settings: {
        slidesToShow: 7,
      },
    },
    {
      breakpoint: 2700,
      settings: {
        slidesToShow: 8,
      },
    },
    {
      breakpoint: 2980,
      settings: {
        slidesToShow: 9,
      },
    },
    {
      breakpoint: 3240,
      settings: {
        slidesToShow: 10,
      },
    },
    {
      breakpoint: 3520,
      settings: {
        slidesToShow: 11,
      },
    },
  ],
}

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
