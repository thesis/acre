import React from "react"
import { ArrowUpRight } from "#/assets/icons"
import { Box, Flex, Icon } from "@chakra-ui/react"
import { Variants, motion } from "framer-motion"
import { chakraUnitToPx } from "#/theme/utils"

const arrowUpVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: (boxSizePx: number) => ({
    x: [0, boxSizePx],
    y: [0, -boxSizePx],
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
    y: [boxSizePx, 0],
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
      <Flex
        pos="absolute"
        as={motion.div}
        boxSize={boxSize}
        custom={boxSizePx}
        variants={arrowUpVariants}
      >
        <Icon as={ArrowUpRight} boxSize={boxSize} color={color} />
      </Flex>
      <Flex
        pos="absolute"
        as={motion.div}
        boxSize={boxSize}
        custom={boxSizePx}
        variants={arrowBottomVariants}
      >
        <Icon as={ArrowUpRight} boxSize={boxSize} color={color} />
      </Flex>
    </Box>
  )
}
