import React from "react"
import { TagProps, Tag, TagLabel, Box } from "@chakra-ui/react"
import { motion } from "framer-motion"

const MotionBox = motion(Box)

export function LiveTag(props: TagProps) {
  return (
    <Tag
      px={4}
      py={2}
      rounded="3xl"
      bg="grey.700"
      variant="solid"
      pos="relative"
      {...props}
    >
      <Box rounded="full" w={2} h={2} mr={3} bg="brand.400" />
      <MotionBox
        pos="absolute"
        rounded="full"
        w={2}
        h={2}
        bg="brand.400"
        animate={{ scale: [1, 6], opacity: [0.5, 0] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      <TagLabel
        color="gold.200"
        textTransform="uppercase"
        fontStyle="italic"
        overflow="visible"
        fontSize="md"
        lineHeight={5}
        fontWeight="bold"
      >
        Live
      </TagLabel>
    </Tag>
  )
}
