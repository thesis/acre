import React, { useEffect, useState } from "react"
import { ModalBody, ModalHeader, ModalCloseButton } from "@chakra-ui/react"
import { useConnectors, useIsEmbed, useWalletConnectionError } from "#/hooks"
import { OrangeKitConnector, BaseModalProps, OnSuccessCallback } from "#/types"
// import { wallets } from "#/constants"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"
import ConnectWalletErrorAlert from "./ConnectWalletErrorAlert"

export function ConnectWalletModalBase({
  onSuccess,
  withCloseButton = true,
}: {
  onSuccess?: OnSuccessCallback
} & BaseModalProps) {
  const { isEmbed } = useIsEmbed()
  const connectors = useConnectors()
  const enabledConnectors = connectors.map((connector) => ({
    ...connector,
    isDisabled: false,
  }))

  const [selectedConnectorId, setSelectedConnectorId] = useState<string>()
  const { connectionError, resetConnectionError } = useWalletConnectionError()

  const handleButtonOnClick = (connector: OrangeKitConnector) => {
    resetConnectionError()
    setSelectedConnectorId(connector.id)
  }

  useEffect(() => {
    if (!isEmbed) return

    setSelectedConnectorId(enabledConnectors[0].id)
  }, [enabledConnectors, isEmbed])

  return (
    <>
      {withCloseButton && (
        <ModalCloseButton onClick={() => resetConnectionError()} />
      )}
      <ModalHeader>{`Select your ${isEmbed ? "account" : "wallet"}`}</ModalHeader>

      <ModalBody gap={0}>
        <ConnectWalletErrorAlert {...connectionError} />

        {enabledConnectors.map((connector) => (
          <ConnectWalletButton
            key={connector.id}
            label={connector.name}
            connector={connector}
            onClick={() => handleButtonOnClick(connector)}
            isSelected={selectedConnectorId === connector.id}
            onSuccess={onSuccess}
          />
        ))}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase, {
  returnFocusOnClose: false,
})
export default ConnectWalletModal
