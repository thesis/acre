import React, { useState } from "react"
import {
  ModalBody,
  ModalHeader,
  VStack,
  ModalCloseButton,
} from "@chakra-ui/react"
import { useConnectors } from "wagmi"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"

export function ConnectWalletModalBase() {
  const connectors = useConnectors()

  const [selectedConnectorId, setSelectedConnectorId] = useState<
    string | undefined
  >(undefined)

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect a Wallet</ModalHeader>
      <ModalBody>
        <VStack>
          {connectors.map((connector) => (
            <ConnectWalletButton
              key={connector.id}
              label={connector.name}
              connector={connector}
              onClick={() => setSelectedConnectorId(connector.id)}
              isSelected={selectedConnectorId === connector.id}
            />
          ))}
        </VStack>
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
