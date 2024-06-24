import React, { useCallback, useEffect } from "react"
import { Box, Button, Flex } from "@chakra-ui/react"
import { Connector } from "wagmi"
import { useAppDispatch, useModal, useSignMessage, useWallet } from "#/hooks"
import { setIsSignedMessage } from "#/store/wallet"
import { logPromiseFailure, orangeKit } from "#/utils"
import { OrangeKitConnector } from "#/types"
import { TextMd } from "../shared/Typography"
import ConnectWalletStatusLabel from "./ConnectWalletStatusLabel"

type ConnectWalletButtonProps = {
  label: string
  onClick: () => void
  isSelected: boolean
  isDisabled: boolean
  connector: Connector
}

export default function ConnectWalletButton({
  label,
  onClick,
  isSelected,
  isDisabled,
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

  const hasConnectionError = connectionStatus === "error"
  const hasSignMessageStatus = signMessageStatus === "error"
  const showStatuses = isSelected && !hasConnectionError
  const showRetryButton = address && hasSignMessageStatus

  const onSuccess = useCallback(() => {
    closeModal()
    dispatch(setIsSignedMessage(true))
  }, [closeModal, dispatch])

  const handleSignMessage = useCallback(
    async (connectedConnector: Connector) => {
      if (orangeKit.isOrangeKitConnector(connectedConnector)) {
        const orangeKitConnector =
          connectedConnector as unknown as OrangeKitConnector
        const btcAddress: string = await orangeKitConnector.getBitcoinAddress()

        if (!btcAddress) return

        const message = orangeKit.createSignInWithWalletMessage(
          btcAddress,
          "bitcoin",
        )
        signMessage(
          {
            message,
            connector: connectedConnector,
          },
          { onSuccess },
        )
      }
    },
    [onSuccess, signMessage],
  )

  const handleSignMessageWrapper = useCallback(
    (connectedConnector: Connector) =>
      logPromiseFailure(handleSignMessage(connectedConnector)),
    [handleSignMessage],
  )

  const handleConnect = useCallback(
    () =>
      onConnect(connector, {
        onSuccess: handleSignMessageWrapper,
      }),
    [connector, handleSignMessageWrapper, onConnect],
  )

  const handleClick = () => {
    onClick()

    // Connector still selected and user wants to retry connect action
    if (isSelected && !isConnected) {
      handleConnect()
    }
  }

  useEffect(() => {
    if (isSelected) handleConnect()
    // Reset the connection when user selects another connector
    else onDisconnect()
  }, [handleConnect, isSelected, onDisconnect])

  return (
    <Box>
      <Button
        onClick={handleClick}
        _hover={isDisabled ? {} : undefined}
        isDisabled={isDisabled}
      >
        {label}
      </Button>
      {showStatuses && (
        <Flex direction="column" gap={2}>
          <TextMd fontWeight="bold">Requires 2 actions:</TextMd>
          <ConnectWalletStatusLabel
            status={connectionStatus}
            label="Connect wallet"
          />
          <ConnectWalletStatusLabel
            status={signMessageStatus}
            label="Sign message"
          />
          {showRetryButton && (
            <Button
              pt={4}
              size="lg"
              variant="outline"
              onClick={() => handleSignMessageWrapper(connector)}
            >
              Resume and try again
            </Button>
          )}
        </Flex>
      )}
    </Box>
  )
}
