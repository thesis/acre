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
import ArrivingSoonTooltip from "./ArrivingSoonTooltip"

const isOkxWalletEnabled =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

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
            {connectors.map((connector) => {
              const isWalletArrivingSoon =
                connector.name === "OKX" && !isOkxWalletEnabled

              return (
                <ArrivingSoonTooltip
                  shouldDisplayTooltip={isWalletArrivingSoon}
                >
                  <Button
                    key={connector.id}
                    onClick={() =>
                      onConnect(connector, {
                        onSuccess: onConnectWalletSuccess,
                        onError: onConnectWalletError,
                      })
                    }
                    isDisabled={isWalletArrivingSoon}
                    _hover={isWalletArrivingSoon ? {} : undefined}
                  >
                    {connector.name}
                  </Button>
                </ArrivingSoonTooltip>
              )
            })}
          </VStack>
        )}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
