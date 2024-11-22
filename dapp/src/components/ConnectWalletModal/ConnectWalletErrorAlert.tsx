import React from "react"
import { Box, VStack } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { ConnectionErrorData } from "#/types"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertIcon,
  AlertProps,
} from "../shared/Alert"

type ConnectWalletErrorAlertProps = AlertProps & Partial<ConnectionErrorData>

const collapseVariants: Variants = {
  collapsed: { height: 0 },
  expanded: { height: "auto" },
}

export default function ConnectWalletErrorAlert(
  props: ConnectWalletErrorAlertProps,
) {
  const { title, description, ...restProps } = props

  const shouldRender = !!(title && description)

  return (
    <AnimatePresence initial={false}>
      {shouldRender && (
        <Box
          as={motion.div}
          variants={collapseVariants}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          overflow="hidden"
          w="full"
        >
          <Alert status="error" mb={6} {...restProps}>
            <AlertIcon />
            <VStack w="full" align="start" spacing={0}>
              <AlertTitle textAlign="start">{title}</AlertTitle>
              <AlertDescription>{description}</AlertDescription>
            </VStack>
          </Alert>
        </Box>
      )}
    </AnimatePresence>
  )
}
