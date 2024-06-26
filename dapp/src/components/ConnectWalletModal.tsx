import React, { useMemo, useState } from "react"
import { useConnector, useModal, useWallet } from "#/hooks"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Image,
  ImageProps,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  VStack,
  Box,
} from "@chakra-ui/react"
import { Connector, useConnectors } from "wagmi"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { isSupportedBTCAddressType, orangeKit } from "#/utils"
import { ConnectionErrorData } from "#/types"
import { CONNECTION_ERRORS } from "#/constants"
import withBaseModal from "./ModalRoot/withBaseModal"
import { TextLg, TextMd } from "./shared/Typography"
import ArrivingSoonTooltip from "./ArrivingSoonTooltip"
import { Alert, AlertTitle, AlertDescription } from "./shared/Alert"

const disabledConnectorIds = [
  import.meta.env.VITE_FEATURE_FLAG_OKX_WALLET_ENABLED !== "true"
    ? "orangekit-okx"
    : "",
].filter(Boolean)

const collapseVariants: Variants = {
  collapsed: { height: 0 },
  expanded: { height: "auto" },
}

const iconStyles: Record<string, ImageProps> = {
  "orangekit-unisat": {
    p: 0.5,
  },
}

export function ConnectWalletModalBase() {
  const connectors = useConnectors()
  const enabledConnectors = useMemo(
    () =>
      connectors.map((connector) => ({
        ...connector,
        disabled: disabledConnectorIds.includes(connector.id),
      })),
    [connectors],
  )
  const { onConnect } = useWallet()
  const currentConnector = useConnector()
  const { closeModal } = useModal()

  const [connectionError, setConnectionError] = useState<ConnectionErrorData>()
  const resetConnectionError = () => setConnectionError(undefined)

  const handleConnection = (connector: Connector) => () => {
    resetConnectionError()

    // This is a workaround. Should be handled by OrangeKit
    const address = connector.getBitcoinAddress() as string
    if (address && !isSupportedBTCAddressType(address)) {
      setConnectionError(CONNECTION_ERRORS.NOT_SUPPORTED)
      return
    }

    onConnect(connector, {
      onSuccess: () => {
        closeModal()
      },
      onError: (error) => {
        const errorData = orangeKit.parseOrangeKitConnectionError(error)
        setConnectionError(errorData)
      },
    })
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect your wallet</ModalHeader>

      <ModalBody gap={0}>
        <AnimatePresence initial={false}>
          {connectionError && (
            <Box
              as={motion.div}
              variants={collapseVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              overflow="hidden"
              w="full"
            >
              <Alert status="error" mb={6}>
                <AlertTitle>{connectionError.title}</AlertTitle>
                <AlertDescription>
                  {connectionError.description}
                </AlertDescription>
              </Alert>
            </Box>
          )}
        </AnimatePresence>

        {enabledConnectors.map((connector) => (
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
              <ArrivingSoonTooltip shouldDisplayTooltip={connector.disabled}>
                <Button
                  variant="ghost"
                  boxSize="full"
                  justifyContent="start"
                  p={6}
                  onClick={handleConnection(connector)}
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
                    <Icon as={IconArrowNarrowRight} boxSize={6} ml="auto" />
                  }
                  iconSpacing={4}
                  isDisabled={connector.disabled}
                >
                  <TextLg flex={1} textAlign="start" fontWeight="semibold">
                    {connector.name}
                  </TextLg>
                </Button>
              </ArrivingSoonTooltip>
            </CardHeader>

            <AnimatePresence initial={false}>
              {currentConnector?.id === connector.id && ( // TODO: Adjust the condition
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
                  >
                    <TextMd>Status content</TextMd>
                  </VStack>
                </CardBody>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </ModalBody>
    </>
  )
}

const ConnectWalletModal = withBaseModal(ConnectWalletModalBase)
export default ConnectWalletModal
