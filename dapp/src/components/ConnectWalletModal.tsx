import React from "react"
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
} from "@chakra-ui/react"
import { IconArrowNarrowRight } from "@tabler/icons-react"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { Connector, useConnectors } from "wagmi"
import withBaseModal from "./ModalRoot/withBaseModal"
import { TextLg, TextMd } from "./shared/Typography"
// import { Alert, AlertTitle, AlertDescription } from "./shared/Alert"

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
  const { onConnect } = useWallet()
  const currentConnector = useConnector()
  const { closeModal } = useModal()

  // TODO: Use commented code to integrate wallet connection error handling
  // const mockError = { title: "Error", description: "An error occured!" }

  const handleConnection = (connector: Connector) => () => {
    onConnect(connector, {
      onSuccess: () => {
        closeModal()
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

      <ModalBody gap={0}>
        <AnimatePresence initial={false}>
          {/* {mockError && ( // TODO: Add a condition
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
                <AlertTitle>{mockError.title}</AlertTitle>
                <AlertDescription>{mockError.description}</AlertDescription>
              </Alert>
            </Box>
          )} */}
        </AnimatePresence>

        {connectors.map((connector) => (
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
