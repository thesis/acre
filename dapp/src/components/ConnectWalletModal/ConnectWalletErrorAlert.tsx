import React from "react"
import { Box } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { ConnectionErrorData } from "#/types"
import {
  Alert,
  AlertDescription,
  AlertTitle,
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
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </Alert>
        </Box>
      )}
    </AnimatePresence>
  )
}
