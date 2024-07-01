import React, { useState } from "react"
import {
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  // VStack,
} from "@chakra-ui/react"
import { useConnectors } from "#/hooks"
import { AnimatePresence } from "framer-motion"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"
// import { Alert, AlertTitle, AlertDescription, AlertIcon } from "./shared/Alert"

const disabledConnectorIds = [
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED !== "true"
    ? "orangekit-okx"
    : "",
].filter(Boolean)

export function ConnectWalletModalBase() {
  const connectors = useConnectors()
  const enabledConnectors = connectors.map((connector) => ({
    ...connector,
    isDisabled: disabledConnectorIds.includes(connector.id),
  }))

  const [selectedConnectorId, setSelectedConnectorId] = useState<string>()

  // TODO: Use commented code to integrate wallet connection error handling
  // const mockError = { title: "Error", description: "An error occured!" }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect your wallet</ModalHeader>

      <ModalBody gap={0}>
        <AnimatePresence initial={false}>
          {/* {mockError && ( // TODO: Add a condition
            <Box
              as={motion.div}
              variants={collapseVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              overflow="hidden"
              w="full"
            >
              <Alert status="error" mb={6}>
                <AlertIcon />
                <VStack w="full" align="start" spacing={0}>
                  <AlertTitle>{mockError.title}</AlertTitle>
                  <AlertDescription>{mockError.description}</AlertDescription>
                </VStack>
                </Alert>
            </Box>
          )} */}
        </AnimatePresence>
        {enabledConnectors.map((connector) => (
          <ConnectWalletButton
            key={connector.id}
            label={connector.name}
            connector={connector}
            onClick={() => setSelectedConnectorId(connector.id)}
            isSelected={selectedConnectorId === connector.id}
          />
        ))}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
