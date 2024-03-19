import React, { forwardRef } from "react"
import { FlexProps, Flex } from "@chakra-ui/react"
import Slider, { Settings as SliderProps } from "react-slick"

const carouselSettings: SliderProps = {
  dots: false,
  infinite: false,
  draggable: false,
  variableWidth: true,
  speed: 500,
  slidesToShow: 12,
  slidesToScroll: 1,
}

type CarouselProps = FlexProps &
  SliderProps & {
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
