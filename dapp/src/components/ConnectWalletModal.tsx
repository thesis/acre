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
import withBaseModal from "./ModalRoot/withBaseModal"

function ConnectWalletModalBase() {
  const connectors = useConnectors()
  const { address, onConnect } = useWallet()
  const { closeModal } = useModal()

  useEffect(() => {
    if (!address) return

    closeModal()
  }, [address, closeModal])

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect a Wallet</ModalHeader>
      <ModalBody>
        <VStack>
          {connectors.map((connector) => (
            <Button key={connector.id} onClick={() => onConnect(connector)}>
              {connector.name}
            </Button>
          ))}
        </VStack>
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
