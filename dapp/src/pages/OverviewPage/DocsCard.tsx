import React from "react"
import { Card, CardProps, HStack } from "@chakra-ui/react"
import { useDocsDrawer } from "#/hooks"
import { TextSm } from "#/components/shared/Typography"
import { ArrowUpRightAnimatedIcon } from "#/assets/icons/animated"
import { motion } from "framer-motion"

export function DocsCard(props: CardProps) {
  const { onOpen } = useDocsDrawer()

  return (
    <Card
      width={64}
      h={28}
      p={4}
      pt={3}
      borderWidth={1}
      borderColor="gold.100"
      onClick={onOpen}
      as={motion.div}
      initial="initial"
      whileHover="animate"
      cursor="pointer"
      {...props}
    >
      <HStack mb={5}>
        <ArrowUpRightAnimatedIcon />
        <TextSm fontWeight="semibold">Documentation</TextSm>
      </HStack>
      <TextSm>Everything you need to know about our contracts.</TextSm>
    </Card>
  )
}
