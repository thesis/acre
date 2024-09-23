import React, { useCallback, useState } from "react"
import { CONNECTION_ERRORS, ONE_SEC_IN_MILLISECONDS } from "#/constants"
import {
  useAppDispatch,
  useModal,
  useSignMessageAndCreateSession,
  useWallet,
  useWalletConnectionError,
} from "#/hooks"
import { setIsSignedMessage } from "#/store/wallet"
import { OrangeKitConnector, OrangeKitError, OnSuccessCallback } from "#/types"
import { eip1193, logPromiseFailure, orangeKit } from "#/utils"
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
    onConnect,
    onDisconnect,
    status: connectionStatus,
  } = useWallet()
  const { signMessageStatus, signMessageAndCreateSession } =
    useSignMessageAndCreateSession()
  const { setConnectionError } = useWalletConnectionError()
  const { closeModal } = useModal()
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const hasConnectionError = connectionStatus === "error"
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

  const handleSignMessageAndCreateSession = useCallback(
    async (connectedConnector: OrangeKitConnector, btcAddress: string) => {
      try {
        await signMessageAndCreateSession(connectedConnector, btcAddress)

        onSuccessSignMessage()
      } catch (error) {
        if (eip1193.didUserRejectRequest(error)) return

        console.error("Failed to sign siww message", error)
        setConnectionError(CONNECTION_ERRORS.INVALID_SIWW_SIGNATURE)
      }
    },
    [signMessageAndCreateSession, onSuccessSignMessage, setConnectionError],
  )

  const onSuccessConnection = useCallback(
    async (connectedConnector: OrangeKitConnector) => {
      const btcAddress: string = await connectedConnector.getBitcoinAddress()

      if (!btcAddress) return

      await handleSignMessageAndCreateSession(connector, btcAddress)
    },
    [connector, handleSignMessageAndCreateSession],
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
    onDisconnect()

    const isInstalled = orangeKit.isWalletInstalled(connector)

    if (!isInstalled) {
      handleRedirectUser()
      return
    }

    handleConnection()
    onClick()
  }

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
                    onClick={() =>
                      logPromiseFailure(
                        handleSignMessageAndCreateSession(connector, address),
                      )
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
