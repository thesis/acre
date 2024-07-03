import React, { useState } from "react"
import { ModalBody, ModalHeader, ModalCloseButton } from "@chakra-ui/react"
import { useConnectors } from "#/hooks"
import { AnimatePresence } from "framer-motion"
import { BaseModalProps, OnSuccessCallback } from "#/types"
import { featureFlags } from "#/constants"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"
// import { Alert, AlertTitle, AlertDescription } from "./shared/Alert"

const disabledConnectorIds = [
  featureFlags.OKX_WALLET_ENABLED ? "orangekit-okx" : "",
].filter(Boolean)

export function ConnectWalletModalBase({
  onSuccess,
}: {
  onSuccess?: OnSuccessCallback
} & BaseModalProps) {
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
                <AlertTitle>{mockError.title}</AlertTitle>
                <AlertDescription>{mockError.description}</AlertDescription>
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
            onSuccess={onSuccess}
          />
        ))}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
