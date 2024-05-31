import React from "react"
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
  Image,
  Box,
} from "@chakra-ui/react"
import { H5, TextLg, TextMd, TextSm } from "#/components/shared/Typography"
import { useModal } from "#/hooks"
import confettiGif from "#/assets/gifs/confetti.gif"
import { BENEFITS } from "#/constants"
import withBaseModal from "./ModalRoot/withBaseModal"

function WelcomeModalBase() {
  const { closeModal } = useModal()
  const handleCloseModal = () => {
    closeModal()
  }

  return (
    <>
      <ModalHeader
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={3}
      >
        <H5 color="brand.400" fontWeight="semibold">
          Welcome to your dashboard!
        </H5>
        <TextMd color="grey.600">It is time to stack up the rewards!</TextMd>
      </ModalHeader>
      <ModalBody
        flexDirection="row"
        gap={4}
        justifyContent="center"
        alignItems="flex-start"
        overflow="visible"
      >
        {BENEFITS.map(({ name, description, imageSrc }) => (
          //  13.25rem -> 212px
          <VStack key={name} w="13.25rem">
            <Box
              w="100%"
              h="7.5rem" // 120px
              border="1px solid white"
              borderRadius="xl"
              bgImage={confettiGif}
              bgSize="cover"
              bgBlendMode="multiply"
              bgColor="gold.200"
              display="flex"
              alignItems="flex-end"
            >
              <Image
                src={imageSrc}
                maxW="7.5rem" // 120px
                mx="auto"
              />
            </Box>
            <TextLg fontWeight="bold" color="grey.700">
              {name}
            </TextLg>
            <TextSm px={1} color="grey.600">
              {description}
            </TextSm>
          </VStack>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button
          size="lg"
          w="13.25rem" // 212px
          fontWeight="bold"
          onClick={handleCloseModal}
        >
          Claim rewards
        </Button>
      </ModalFooter>
    </>
  )
}

const WelcomeModal = withBaseModal(WelcomeModalBase, { size: "xl" })
export default WelcomeModal
