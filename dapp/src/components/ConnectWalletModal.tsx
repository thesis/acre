import React from "react"
import {
  Button,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  Card,
  CardHeader,
  CardBody,
  Image,
  ImageProps,
  Icon,
  VStack,
} from "@chakra-ui/react"
import { useConnector, useWallet } from "#/hooks"
import { Connector, useConnectors } from "wagmi"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import withBaseModal from "./ModalRoot/withBaseModal"
import { TextLg, TextMd } from "./shared/Typography"

const iconStyles: Record<string, ImageProps> = {
  "orangekit-unisat": {
    p: 0.5,
  },
}

export function ConnectWalletModalBase() {
  const connectors = useConnectors()
  const { onConnect } = useWallet()
  const currentConnector = useConnector()

  const handleConnection = (connector: Connector) => () => {
    onConnect(connector, {
      onSuccess: () => {
        // closeModal()
      },
      onError: (error: unknown) => {
        // TODO: Handle when the wallet connection fails
        console.error(error)
      },
    })
  }

  return (
    <>
      <ModalCloseButton />
      <ModalHeader>Connect your wallet</ModalHeader>

      <ModalBody gap={3}>
        {connectors.map((connector) => (
          <Card
            key={connector.id}
            alignSelf="stretch"
            borderWidth={1}
            borderColor="gold.300"
            rounded="lg"
          >
            <CardHeader p={0}>
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
              >
                <TextLg flex={1} textAlign="start" fontWeight="semibold">
                  {connector.name}
                </TextLg>
              </Button>
            </CardHeader>

            <AnimatePresence initial={false}>
              {currentConnector?.id === connector.id && ( // TODO: Adjust the condition
                <CardBody
                  as={motion.div}
                  initial={{ height: 0 }}
                  exit={{ height: 0 }}
                  animate={{ height: "auto" }}
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
