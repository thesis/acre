import React, { useCallback, useEffect } from "react"
import { Box, Button } from "@chakra-ui/react"
import { Connector } from "wagmi"
import { useModal, useWallet } from "#/hooks"
import { TextMd } from "../shared/Typography"
import ConnectWalletStatusLabel from "./ConnectWalletStatusLabel"

type ConnectWalletButtonProps = {
  label: string
  onClick: () => void
  isSelected: boolean
  connector: Connector
}

export default function ConnectWalletButton({
  label,
  onClick,
  isSelected,
  connector,
}: ConnectWalletButtonProps) {
  const { onConnect, status: connectionStatus } = useWallet()
  const { closeModal } = useModal()

  const onSuccess = useCallback(() => {
    closeModal()
  }, [closeModal])

  const onError = (error: unknown) => {
    console.error(error)
  }

  const handleConnect = useCallback(() => {
    onConnect(connector, {
      onSuccess,
      onError,
    })
  }, [connector, onConnect, onSuccess])

  const handleClick = useCallback(() => {
    if (isSelected) {
      handleConnect()
    } else {
      onClick()
    }
  }, [handleConnect, isSelected, onClick])

  useEffect(() => {
    if (isSelected) {
      handleConnect()
    }
  }, [connector, handleConnect, isSelected, onConnect, onSuccess])

  return (
    <Box>
      <Button onClick={handleClick}>{label}</Button>
      {isSelected && (
        <Box>
          <TextMd fontWeight="bold">Requires 2 actions:</TextMd>
          <ConnectWalletStatusLabel
            status={connectionStatus}
            label="Connect wallet"
          />
        </Box>
      )}
    </Box>
  )
}
