import React from "react"
import { CustomArrowProps } from "react-slick"
import { IconButton, IconButtonProps } from "@chakra-ui/react"
import { ArrowLeft, ArrowRight } from "#/assets/icons"

type PaginationArrowType = CustomArrowProps & IconButtonProps

function PaginationArrow({ icon, onClick, ...props }: PaginationArrowType) {
  return (
    <IconButton
      icon={icon}
      variant="pagination"
      size="sm"
      borderRadius={32}
      onClick={onClick}
      isDisabled={onClick === null}
      {...props}
    />
  )
}

export function PrevArrowCarousel({ onClick }: CustomArrowProps) {
  return (
    <PaginationArrow
      position="absolute"
      mr={2}
      right={-56}
      top={-10}
      onClick={onClick}
      icon={<ArrowLeft />}
      aria-label="prev"
      data-id="slick-arrow-prev"
    />
  )
}
export function NextArrowCarousel({ onClick }: CustomArrowProps) {
  return (
    <PaginationArrow
      position="absolute"
      right={-64}
      top={-10}
      onClick={onClick}
      icon={<ArrowRight />}
      aria-label="next"
      data-id="slick-arrow-next"
    />
  )
}
