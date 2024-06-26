import React, { useCallback, useEffect } from "react"
import { Box, Button, Flex } from "@chakra-ui/react"
import { useAppDispatch, useModal, useWallet } from "#/hooks"
import { setIsSignedMessage } from "#/store/wallet"
import { logPromiseFailure, orangeKit } from "#/utils"
import { OrangeKitConnector } from "#/types"
import { useSignMessage } from "wagmi"
import { TextMd } from "../shared/Typography"
import ConnectWalletStatusLabel from "./ConnectWalletStatusLabel"
import ArrivingSoonTooltip from "../ArrivingSoonTooltip"

const isOkxWalletEnabled =
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED === "true"

type ConnectWalletButtonProps = {
  label: string
  onClick: () => void
  isSelected: boolean
  connector: OrangeKitConnector
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

  const isWalletArrivingSoon = connector.name === "OKX" && !isOkxWalletEnabled
  const hasConnectionError = connectionStatus === "error"
  const hasSignMessageStatus = signMessageStatus === "error"
  const showStatuses = isSelected && !hasConnectionError
  const showRetryButton = address && hasSignMessageStatus

  const onSuccess = useCallback(() => {
    closeModal()
    dispatch(setIsSignedMessage(true))
  }, [closeModal, dispatch])

  const handleSignMessage = useCallback(
    async (connectedConnector: OrangeKitConnector) => {
      const btcAddress: string = await connectedConnector.getBitcoinAddress()

      if (!btcAddress) return

      const message = orangeKit.createSignInWithWalletMessage(btcAddress)
      signMessage(
        {
          message,
          connector: orangeKit.typeConversionToConnector(connectedConnector),
        },
        { onSuccess },
      )
    },
    [onSuccess, signMessage],
  )

  const handleSignMessageWrapper = useCallback(
    (connectedConnector: OrangeKitConnector) =>
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
    <ArrivingSoonTooltip shouldDisplayTooltip={isWalletArrivingSoon}>
      <Box w="100%">
        <Button
          onClick={handleClick}
          _hover={isWalletArrivingSoon ? {} : undefined}
          isDisabled={isWalletArrivingSoon}
        >
          {label}
        </Button>
        {showStatuses && (
          <Flex direction="column" gap={2}>
            <TextMd fontWeight="bold" textAlign="start">
              Requires 2 actions:
            </TextMd>
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
                mt={4}
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
    </ArrivingSoonTooltip>
  )
}
