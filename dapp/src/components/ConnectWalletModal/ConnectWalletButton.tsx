import React, { useCallback, useEffect, useState } from "react"
import { CONNECTION_ERRORS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import {
  useAppDispatch,
  useModal,
  useWallet,
  useWalletConnectionError,
} from "#/hooks"
import { setIsSignedMessage } from "#/store/wallet"
import { OrangeKitConnector, OrangeKitError, OnSuccessCallback } from "#/types"
import {
  isSupportedBTCAddressType,
  logPromiseFailure,
  orangeKit,
} from "#/utils"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Icon,
  Image,
  ImageProps,
  VStack,
} from "@chakra-ui/react"
import { useSignMessage } from "wagmi"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import ArrivingSoonTooltip from "../ArrivingSoonTooltip"
import { TextLg, TextMd } from "../shared/Typography"
import ConnectWalletStatusLabel from "./ConnectWalletStatusLabel"
import Spinner from "../shared/Spinner"

type ConnectWalletButtonProps = {
  label: string
  onClick: () => void
  isSelected: boolean
  connector: OrangeKitConnector & { isDisabled: boolean }
  onSuccess?: OnSuccessCallback
}

const iconStyles: Record<string, ImageProps> = {
  "orangekit-unisat": {
    p: 0.5,
  },
}

const collapseVariants: Variants = {
  collapsed: { height: 0 },
  expanded: { height: "auto" },
}

export default function ConnectWalletButton({
  label,
  onClick,
  isSelected,
  connector,
  onSuccess,
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

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { connectionError, setConnectionError } = useWalletConnectionError()

  const hasConnectionError = connectionError || connectionStatus === "error"
  const hasSignMessageStatus = signMessageStatus === "error"
  const showStatuses = isSelected && !hasConnectionError
  const showRetryButton = address && hasSignMessageStatus

  const onSuccessSignMessage = useCallback(() => {
    closeModal()
    dispatch(setIsSignedMessage(true))

    if (onSuccess) {
      onSuccess()
    }
  }, [closeModal, dispatch, onSuccess])

  const handleSignMessage = useCallback(
    (connectedConnector: OrangeKitConnector, btcAddress: string) => {
      const message = orangeKit.createSignInWithWalletMessage(btcAddress)
      signMessage(
        {
          message,
          connector: orangeKit.typeConversionToConnector(connectedConnector),
        },
        { onSuccess: onSuccessSignMessage },
      )
    },
    [onSuccessSignMessage, signMessage],
  )

  const onSuccessConnection = useCallback(
    async (connectedConnector: OrangeKitConnector) => {
      const btcAddress: string = await connectedConnector.getBitcoinAddress()

      if (!btcAddress) return

      // This is workaround to disallow Nested Segwit addresses.
      // Should be handled by OrangeKit
      if (!isSupportedBTCAddressType(btcAddress)) {
        onDisconnect()
        setConnectionError(CONNECTION_ERRORS.NOT_SUPPORTED)
      } else {
        handleSignMessage(connector, btcAddress)
      }
    },
    [connector, handleSignMessage, onDisconnect, setConnectionError],
  )

  const handleConnection = useCallback(() => {
    onConnect(connector, {
      onSuccess: () => {
        logPromiseFailure(onSuccessConnection(connector))
      },
      onError: (error: OrangeKitError) => {
        const errorData = orangeKit.parseOrangeKitConnectionError(error)
        setConnectionError(errorData)
      },
    })
  }, [onConnect, connector, onSuccessConnection, setConnectionError])

  const handleRedirectUser = useCallback(() => {
    setIsLoading(true)

    setTimeout(() => {
      const wallet = orangeKit.getWalletInfo(connector)

      if (wallet) {
        window.open(wallet.downloadUrls.desktop, "_blank")?.focus()
      }

      setIsLoading(false)
    }, ONE_SEC_IN_MILLISECONDS * 2)
  }, [connector])

  const handleButtonClick = () => {
    const isInstalled = orangeKit.isWalletInstalled(connector)

    if (!isInstalled) {
      handleRedirectUser()
      return
    }

    onClick()

    // Connector still selected and user wants to retry connect action
    if (isSelected && !isConnected) {
      handleConnection()
    }
  }

  useEffect(() => {
    if (isSelected) handleConnection()
    // Reset the connection when user selects another connector
    else onDisconnect()
  }, [handleConnection, isSelected, onDisconnect])

  return (
    <Card
      key={connector.id}
      alignSelf="stretch"
      borderWidth={1}
      borderColor="gold.300"
      rounded="lg"
      mb={3}
      _last={{ mb: 0 }}
    >
      <CardHeader p={0}>
        <ArrivingSoonTooltip shouldDisplayTooltip={connector.isDisabled}>
          <Button
            variant="ghost"
            boxSize="full"
            justifyContent="start"
            p={6}
            onClick={handleButtonClick}
            leftIcon={
              <Image
                src={connector.icon}
                boxSize={6}
                bg="black"
                rounded="sm"
                {...iconStyles[connector.id]}
              />
            }
            rightIcon={
              !isLoading ? (
                <Icon as={IconArrowNarrowRight} boxSize={6} ml="auto" />
              ) : (
                <Spinner boxSize={6} variant="filled" />
              )
            }
            iconSpacing={4}
            isDisabled={connector.isDisabled}
          >
            <TextLg flex={1} textAlign="start" fontWeight="semibold">
              {label}
            </TextLg>
          </Button>
        </ArrivingSoonTooltip>
      </CardHeader>

      <AnimatePresence initial={false}>
        {showStatuses && (
          <CardBody
            as={motion.div}
            variants={collapseVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            p={0}
            overflow="hidden"
            sx={{ flex: undefined }} // To override the default flex: 1
          >
            <VStack
              p={6}
              pt={4}
              borderTopWidth={1}
              borderStyle="solid"
              borderColor="gold.300"
              align="start"
            >
              <Flex direction="column" gap={2} w="full">
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
                    onClick={() => handleSignMessage(connector, address)}
                  >
                    Resume and try again
                  </Button>
                )}
              </Flex>
            </VStack>
          </CardBody>
        )}
      </AnimatePresence>
    </Card>
  )
}
