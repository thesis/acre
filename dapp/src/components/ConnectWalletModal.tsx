import React, { useEffect } from "react"
import {
  Button,
  ModalBody,
  ModalHeader,
  VStack,
  ModalCloseButton,
} from "@chakra-ui/react"
import { useModal, useWallet } from "#/hooks"
import { useConnectors } from "wagmi"
import { BaseModalProps, OnSuccessCallback } from "#/types"
import withBaseModal from "./ModalRoot/withBaseModal"

type ConnectWalletModalBaseProps = BaseModalProps & {
  onSuccess?: OnSuccessCallback
}

function ConnectWalletModalBase({ onSuccess }: ConnectWalletModalBaseProps) {
  const connectors = useConnectors()
  const { isConnected, onConnect, onDisconnect } = useWallet()
  const { closeModal } = useModal()

  const onConnectWalletSuccess = () => {
    closeModal()

    if (onSuccess) onSuccess()
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect a Wallet</ModalHeader>
      <ModalBody>
        {isConnected ? (
          <Button onClick={onDisconnect}>Disconnect</Button>
        ) : (
          <VStack>
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => onConnect(connector, onConnectWalletSuccess)}
              >
                {connector.name}
              </Button>
            ))}
          </VStack>
        )}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
