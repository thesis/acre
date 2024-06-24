import React, { useState } from "react"
import { ModalBody, ModalHeader, ModalCloseButton } from "@chakra-ui/react"
import { useConnectors } from "wagmi"
import withBaseModal from "../ModalRoot/withBaseModal"
import ConnectWalletButton from "./ConnectWalletButton"
import ArrivingSoonTooltip from "../ArrivingSoonTooltip"

const isOkxWalletEnabled =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

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
        {connectors.map((connector) => {
          const isWalletArrivingSoon =
            connector.name === "OKX" && !isOkxWalletEnabled
          return (
            <ArrivingSoonTooltip shouldDisplayTooltip={isWalletArrivingSoon}>
              <ConnectWalletButton
                key={connector.id}
                label={connector.name}
                connector={connector}
                onClick={() => setSelectedConnectorId(connector.id)}
                isSelected={selectedConnectorId === connector.id}
                isDisabled={isWalletArrivingSoon}
              />
            </ArrivingSoonTooltip>
          )
        })}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
