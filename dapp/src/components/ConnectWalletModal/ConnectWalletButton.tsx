import React, { useCallback, useEffect } from "react"
import { Box, Button } from "@chakra-ui/react"
import { Connector } from "wagmi"
import { useAppDispatch, useModal, useSignMessage, useWallet } from "#/hooks"
import { setIsSignedMessage } from "#/store/wallet"
import { orangeKit } from "#/utils"
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
  const {
    address,
    isConnected,
    onConnect,
    onDisconnect,
    status: connectionStatus,
  } = useWallet()
  const { signMessage, status: signMessageStatus } = useSignMessage()
  const { closeModal } = useModal()
  const dispatch = useAppDispatch()

  const onSuccess = useCallback(() => {
    closeModal()
    dispatch(setIsSignedMessage(true))
  }, [closeModal, dispatch])

  const handleSignMessage = useCallback(() => {
    if (!address) return

    const message = orangeKit.createSignInWithWalletMessage(address, "bitcoin")
    signMessage(
      {
        message,
        connector,
      },
      { onSuccess },
    )
  }, [address, connector, onSuccess, signMessage])

  const handleConnect = useCallback(() => {
    onConnect(connector, {
      onSuccess: handleSignMessage,
    })
  }, [connector, handleSignMessage, onConnect])

  const handleClick = () => {
    onClick()

    if (!isSelected) return

    // Connector still selected and user wants to retry action
    if (isConnected) handleSignMessage()
    else handleConnect()
  }

  useEffect(() => {
    if (isSelected) handleConnect()
    else onDisconnect()
  }, [handleConnect, isSelected, onDisconnect])

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
          <ConnectWalletStatusLabel
            status={signMessageStatus}
            label="Sign message"
          />
        </Box>
      )}
    </Box>
  )
}
