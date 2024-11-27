import React from "react"
import { Box, Link, VStack } from "@chakra-ui/react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { EXTERNAL_HREF } from "#/constants"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertIcon,
  AlertProps,
} from "../shared/Alert"

export enum ConnectionAlert {
  Rejected = "REJECTED",
  NotSupported = "NOT_SUPPORTED",
  NetworkMismatch = "NETWORK_MISMATCH",
  InvalidSIWWSignature = "INVALID_SIWW_SIGNATURE",
  Default = "DEFAULT",
}

const CONNECTION_ALERTS = {
  [ConnectionAlert.Rejected]: {
    title: "Wallet connection rejected.",
    description: "If you encountered an error, please try again.",
  },
  [ConnectionAlert.NotSupported]: {
    title: "Not supported.",
    description:
      "Only Native SegWit, Nested SegWit or Legacy addresses supported at this time. Please try a different address or another wallet.",
  },
  [ConnectionAlert.NetworkMismatch]: {
    title: "Error!",
    description:
      "Incorrect network detected in your wallet. Please choose proper network and try again.",
  },
  [ConnectionAlert.Default]: {
    title: "Wallet connection error. Please try again.",
    description: (
      <Box as="span">
        If the problem persists, contact{" "}
        <Link
          color="#0E61FE"
          textDecoration="underline"
          href={EXTERNAL_HREF.DISCORD}
          isExternal
        >
          Acre support
        </Link>
      </Box>
    ),
  },
  [ConnectionAlert.InvalidSIWWSignature]: {
    title: "Invalid Sign In With Wallet signature",
    description: "We encountered an error. Please try again.",
  },
}

const collapseVariants: Variants = {
  collapsed: { height: 0 },
  expanded: { height: "auto" },
}

type ConnectWalletAlertProps = AlertProps & { type?: ConnectionAlert }

export default function ConnectWalletAlert(props: ConnectWalletAlertProps) {
  const { type, ...restProps } = props

  const data = type ? CONNECTION_ALERTS[type] : undefined

  return (
    <AnimatePresence initial={false}>
      {data && (
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
              <AlertTitle textAlign="start">{data.title}</AlertTitle>
              <AlertDescription>{data.description}</AlertDescription>
            </VStack>
          </Alert>
        </Box>
      )}
    </AnimatePresence>
  )
}
