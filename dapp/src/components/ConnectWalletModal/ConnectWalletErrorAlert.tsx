import React from "react"
import { Box, VStack } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { ConnectionAlertData } from "#/types"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertIcon,
  AlertProps,
} from "../shared/Alert"

type ConnectWalletErrorAlertProps = AlertProps & Partial<ConnectionAlertData>

const collapseVariants: Variants = {
  collapsed: { height: 0 },
  expanded: { height: "auto" },
}

export default function ConnectWalletErrorAlert(
  props: ConnectWalletErrorAlertProps,
) {
  const { title, description, type = "error", ...restProps } = props

  const shouldRender = !!(title && type)

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
          <Alert status={type} mb={6} {...restProps}>
            <AlertIcon />
            <VStack w="full" align="start" spacing={0}>
              <AlertTitle textAlign="start">{title}</AlertTitle>
              {description && (
                <AlertDescription>{description}</AlertDescription>
              )}
            </VStack>
          </Alert>
        </Box>
      )}
    </AnimatePresence>
  )
}
