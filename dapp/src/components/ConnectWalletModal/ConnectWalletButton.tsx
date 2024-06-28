import React, { useCallback, useEffect } from "react"
import { CONNECTION_ERRORS } from "#/constants"
import {
  useAppDispatch,
  useModal,
  useWallet,
  useWalletConnectionError,
} from "#/hooks"
import { setIsSignedMessage } from "#/store/wallet"
import { OrangeKitConnector, OrangeKitError } from "#/types"
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
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { useSignMessage } from "wagmi"
import ArrivingSoonTooltip from "../ArrivingSoonTooltip"
import { TextLg, TextMd } from "../shared/Typography"
import ConnectWalletStatusLabel from "./ConnectWalletStatusLabel"

type ConnectWalletButtonProps = {
  label: string
  onClick: () => void
  isSelected: boolean
  connector: OrangeKitConnector & { isDisabled: boolean }
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
  const { connectionError, setConnectionError } = useWalletConnectionError()

  const hasConnectionError = connectionError || connectionStatus === "error"
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

  const handleConnection = useCallback(async () => {
    const bitcoinAddress = await connector.getBitcoinAddress()

    onConnect(connector, {
      onSuccess: () => {
        // This is workaround to disallow Nested Segwit addresses.
        // Should be handled by OrangeKit
        if (!isSupportedBTCAddressType(bitcoinAddress)) {
          onDisconnect()
          setConnectionError(CONNECTION_ERRORS.NOT_SUPPORTED)
          return
        }

        logPromiseFailure(handleSignMessage(connector))
      },
      onError: (error: OrangeKitError) => {
        const errorData = orangeKit.parseOrangeKitConnectionError(error)
        setConnectionError(errorData)
      },
    })
  }, [
    connector,
    handleSignMessage,
    onConnect,
    onDisconnect,
    setConnectionError,
  ])

  const handleButtonClick = () => {
    onClick()

    // Connector still selected and user wants to retry connect action
    if (isSelected && !isConnected) {
      logPromiseFailure(handleConnection())
    }
  }

  useEffect(() => {
    if (isSelected) logPromiseFailure(handleConnection())
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
            rightIcon={<Icon as={IconArrowNarrowRight} boxSize={6} ml="auto" />}
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
                    onClick={() =>
                      logPromiseFailure(handleSignMessage(connector))
                    }
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
