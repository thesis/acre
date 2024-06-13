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
import { BaseModalProps, OnErrorCallback, OnSuccessCallback } from "#/types"
import withBaseModal from "./ModalRoot/withBaseModal"

type ConnectWalletModalBaseProps = BaseModalProps & {
  onSuccess?: OnSuccessCallback
  onError?: OnErrorCallback
}

function ConnectWalletModalBase({
  onSuccess,
  onError,
}: ConnectWalletModalBaseProps) {
  const connectors = useConnectors()
  const { isConnected, onConnect, onDisconnect } = useWallet()
  const { closeModal } = useModal()

  const onConnectWalletSuccess = () => {
    closeModal()

    if (onSuccess) onSuccess()
  }

  const onConnectWalletError = (error: unknown) => {
    // TODO: Handle when the wallet connection fails
    console.error(error)

    if (onError) onError(error)
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
