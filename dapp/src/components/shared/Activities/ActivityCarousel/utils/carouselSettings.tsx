import React from "react"
import { NextArrowCarousel, PrevArrowCarousel } from "./carouselArrows"

/* *
 * Settings for react-slick carousel.
 * Breakpoints are calculated based on with & visibility of activity card.
 * slidesToShow attr is needed to correctly display the number of cards in the carousel
 * and it depends on the width of the viewport.
 * */
export const activityCarouselSettings = {
  dots: false,
  infinite: false,
  draggable: false,
  variableWidth: true,
  speed: 500,
  slidesToShow: 12,
  slidesToScroll: 1,
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
