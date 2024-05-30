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
import boostCardIcon from "#/assets/images/rewards-boost.svg"
import mysteryCardIcon from "#/assets/images/mystery-box.svg"
import keyCardIcon from "#/assets/images/season-key.svg"
import { useModal } from "#/hooks"
import confettiGif from "#/assets/gifs/confetti.gif"
import withBaseModal from "./ModalRoot/withBaseModal"

const BENEFITS = [
  {
    label: "Rewards Boost",
    description: "Boosts your APY when Acre fully launches",
    props: {
      src: boostCardIcon,
      top: "22%",
      maxW: 28,
    },
  },
  {
    label: "All Seasons Access Key",
    description: "First dibs access to upcoming seasons",
    props: {
      src: keyCardIcon,
      maxW: 32,
    },
  },
  {
    label: "Season 1 Mystery Box",
    description: "A surprise gift for the early birds",
    props: {
      src: mysteryCardIcon,
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
      <ModalHeader>
        <VStack gap={3}>
          <H5 color="brand.400" fontWeight="semibold">
            Welcome to your dashboard!
          </H5>
          <TextMd color="grey.600">It is time to stack up the rewards!</TextMd>
        </VStack>
      </ModalHeader>
      <ModalBody
        flexDirection="row"
        gap={4}
        justifyContent="center"
        alignItems="flex-start"
      >
        {BENEFITS.map(({ label, description, props }) => (
          <VStack w="13.25rem">
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
              {label}
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
