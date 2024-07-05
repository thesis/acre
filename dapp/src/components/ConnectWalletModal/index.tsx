import React, { useState } from "react"
import { ModalBody, ModalHeader, ModalCloseButton } from "@chakra-ui/react"
import { useConnectors, useWalletConnectionError } from "#/hooks"
import { OrangeKitConnector, BaseModalProps, OnSuccessCallback } from "#/types"
import { featureFlags } from "#/constants"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"
import ConnectWalletErrorAlert from "./ConnectWalletErrorAlert"

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
  const { connectionError, resetConnectionError } = useWalletConnectionError()

  const handleButtonOnClick = (connector: OrangeKitConnector) => {
    resetConnectionError()
    setSelectedConnectorId(connector.id)
  }

  return (
    <>
      <ModalCloseButton onClick={() => resetConnectionError()} />
      <ModalHeader>Connect your wallet</ModalHeader>

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

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
