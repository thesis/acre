import React from "react"
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VStack,
  Image,
  Box,
  ImageProps,
} from "@chakra-ui/react"
import { H5, TextLg, TextMd, TextSm } from "#/components/shared/Typography"
import { useModal } from "#/hooks"
import confettiGif from "#/assets/gifs/confetti.gif"
import { REWARD_BOOST, SEASON_KEY, MYSTERY_BOX } from "#/constants"
import withBaseModal from "./ModalRoot/withBaseModal"

const BENEFITS: { name: string; description: string; props: ImageProps }[] = [
  {
    name: REWARD_BOOST.name,
    description: REWARD_BOOST.description,
    props: {
      src: REWARD_BOOST.imageSrc,
      top: "22%",
      maxW: 28,
    },
  },
  {
    name: SEASON_KEY.name,
    description: SEASON_KEY.description,
    props: {
      src: SEASON_KEY.imageSrc,
      maxW: 32,
    },
  },
  {
    name: MYSTERY_BOX.name,
    description: MYSTERY_BOX.description,
    props: {
      src: MYSTERY_BOX.imageSrc,
      maxW: 28,
      top: "33%",
    },
  },
]

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
      >
        {BENEFITS.map(({ name, description, props }) => (
          <VStack key={name} w="13.25rem">
            <Box
              w="100%"
              h="7.5rem"
              border="1px solid white"
              borderRadius="xl"
              bgImage={confettiGif}
              bgSize="cover"
              bgBlendMode="multiply"
              bgColor="gold.200"
              position="relative"
            />
            <Image position="absolute" {...props} />
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
          w="13.25rem"
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
