import React, { useEffect, useState } from "react"
import { ModalBody, ModalHeader, ModalCloseButton } from "@chakra-ui/react"
import { useConnectors } from "wagmi"
import { useIsSignedMessage, useWallet } from "#/hooks"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"

export function ConnectWalletModalBase() {
  const connectors = useConnectors()
  const isSignedMessage = useIsSignedMessage()
  const { onDisconnect } = useWallet()

  const [selectedConnectorId, setSelectedConnectorId] = useState<
    string | undefined
  >(undefined)

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      //  Disconnect when a user closes the modal and has not signed the message.
      if (!isSignedMessage) onDisconnect()
    }
  }, [isSignedMessage, onDisconnect])

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect a Wallet</ModalHeader>
      <ModalBody>
        {connectors.map((connector) => (
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
