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
      color="gold.200"
      bg="grey.700"
      variant="solid"
      fontSize="md"
      lineHeight={5}
      fontWeight="bold"
      gap={3}
      {...props}
    >
      <Box pos="relative">
        <Box rounded="full" w={2} h={2} bg="brand.400" />
        <MotionBox
          pos="absolute"
          top={0}
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
      </Box>
      <TagLabel
        textTransform="uppercase"
        fontStyle="italic"
        overflow="visible"
        fontSize="inherit"
        fontWeight="inherit"
        lineHeight="inherit"
      >
        Live
      </TagLabel>
    </Tag>
  )
}
