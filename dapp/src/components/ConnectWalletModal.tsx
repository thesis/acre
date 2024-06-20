import React from "react"
import {
  Button,
  ModalBody,
  ModalHeader,
  VStack,
  ModalCloseButton,
} from "@chakra-ui/react"
import { useModal, useWallet } from "#/hooks"
import { useConnectors } from "wagmi"
import withBaseModal from "./ModalRoot/withBaseModal"

export function ConnectWalletModalBase() {
  const connectors = useConnectors()
  const { isConnected, onConnect, onDisconnect } = useWallet()
  const { closeModal } = useModal()

  const onConnectWalletSuccess = () => {
    closeModal()
  }

  const onConnectWalletError = (error: unknown) => {
    // TODO: Handle when the wallet connection fails
    console.error(error)
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
                onClick={() =>
                  onConnect(connector, {
                    onSuccess: onConnectWalletSuccess,
                    onError: onConnectWalletError,
                  })
                }
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
