import React from "react"
import { ArrowUpRight } from "#/assets/icons"
import { Box, Icon } from "@chakra-ui/react"
import { Variants, motion } from "framer-motion"
import { chakraUnitToPx } from "#/theme/utils"

const arrowUpVariants: Variants = {
  initial: {
    x: 0,
    y: -5,
  },
  animate: (boxSizePx: number) => ({
    x: [0, boxSizePx],
    y: [-5, -boxSizePx],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  }),
}

const arrowBottomVariants: Variants = {
  initial: (boxSizePx: number) => ({
    x: -boxSizePx,
    y: boxSizePx,
  }),
  animate: (boxSizePx: number) => ({
    x: [-boxSizePx, 0],
    y: [boxSizePx, -5],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  }),
}

type ArrowUpRightAnimatedIconProps = {
  boxSize?: number
  color?: string
}

export function ArrowUpRightAnimatedIcon({
  boxSize = 4,
  color = "brand.400",
}: ArrowUpRightAnimatedIconProps) {
  const boxSizePx = chakraUnitToPx(boxSize)
  return (
    <Box pos="relative" boxSize={boxSize} overflow="hidden">
      {[
        { id: "arrow-up", variants: arrowUpVariants },
        { id: "arrow-bottom", variants: arrowBottomVariants },
      ].map(({ id, variants }) => (
        <Box
          key={id}
          pos="absolute"
          as={motion.div}
          boxSize={boxSize}
          custom={boxSizePx}
          variants={variants}
        >
          <Icon as={ArrowUpRight} boxSize={boxSize} color={color} />
        </Box>
      ))}
    </Box>
  )
}
