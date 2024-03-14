import React, { forwardRef } from "react"
import { BoxProps, Flex } from "@chakra-ui/react"
import Slider from "react-slick"

const carouselSettings = {
  dots: false,
  infinite: false,
  draggable: false,
  variableWidth: true,
  speed: 500,
  slidesToShow: 12,
  slidesToScroll: 1,
}

type CarouselProps = BoxProps & {
  children: React.ReactNode
}

export const Carousel = forwardRef<HTMLInputElement, CarouselProps>(
  (props, ref) => (
    <Flex
      as={Slider}
      ref={ref}
      overflowX="hidden"
      {...carouselSettings}
      {...props}
    >
      {props.children}
    </Flex>
  ),
)
