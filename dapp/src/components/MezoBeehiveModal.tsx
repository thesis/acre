import React from "react"
import {
  ModalBody,
  ModalHeader,
  HStack,
  VStack,
  Highlight,
  Icon,
  Button,
  Card,
  CardBody,
  CardHeader,
  ModalCloseButton,
  Image,
  Link,
  Flex,
} from "@chakra-ui/react"
import { TextMd, TextXl } from "#/components/shared/Typography"
import { AcreSignIcon, MezoSignIcon } from "#/assets/icons"
import {
  IconArrowUpRight,
  IconChartPieFilled,
  IconCircleCheckFilled,
  IconInfoCircle,
} from "@tabler/icons-react"
import { EXTERNAL_HREF } from "#/constants"
import mezoBeehiveModalIllustrationSrc from "#/assets/images/mezo-beehive-modal-illustration.svg"
import withBaseModal from "./ModalRoot/withBaseModal"

function MezoBeehiveModalBase() {
  return (
    <>
      <ModalCloseButton />
      <ModalHeader as={VStack} p={8}>
        <TextXl fontWeight="bold">Acre & Mezo</TextXl>
        <Flex>
          <AcreSignIcon boxSize={10} rounded="full" />
          <MezoSignIcon
            boxSize={10}
            rounded="full"
            ml={-2}
            ring={3}
            ringColor="gold.100"
          />
        </Flex>
      </ModalHeader>

      <ModalBody gap={4} pb={8}>
        <VStack spacing={0} align="stretch">
          <Image src={mezoBeehiveModalIllustrationSrc} alt="Mezo Beehive" />

          <TextMd lineHeight={5}>
            <Highlight query="Mezo Points" styles={{ fontWeight: 700 }}>
              Mezo Points are collected from all Acre deposits
            </Highlight>
          </TextMd>
        </VStack>

        <Card
          gap={2}
          p={5}
          rounded="xl"
          bg="grey.700"
          borderWidth={0}
          color="gold.300"
          align="start"
          textAlign="start"
          position="relative"
          mt={4}
          mb={6}
          _before={{
            content: '""',
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            w: 4,
            h: 2,
            bg: "inherit",
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "auto",
            translateX: "-50%",
            translateY: "-100%",
          }}
        >
          <CardHeader p={0} as={HStack}>
            <Icon as={IconChartPieFilled} color="brand.400" boxSize={5} />
            <TextMd lineHeight={5} fontWeight="bold">
              Your share
            </TextMd>
          </CardHeader>

          <CardBody p={0}>
            <TextMd lineHeight={5}>
              <Highlight
                query={["deposit amount and duration", "Acre"]}
                styles={{ fontWeight: "bold", color: "inherit" }}
              >
                In the event of a reward distribution, your share will be
                calculated based on your deposit amount and duration. You will
                be able to claim your share directly from Acre.
              </Highlight>
            </TextMd>
          </CardBody>
        </Card>

        <VStack spacing={3} align="stretch">
          <Card bg="gold.300" borderWidth={0} rounded="xl">
            <CardBody
              as={HStack}
              spacing={6}
              p={5}
              color="grey.700"
              textAlign="start"
            >
              <MezoSignIcon
                boxSize="5.5rem" // 88px
                rounded="lg"
              />
              <VStack align="start">
                <TextMd lineHeight={5}>
                  <Highlight query="Mezo" styles={{ fontWeight: "bold" }}>
                    Mezo is the economic layer for Bitcoin with a mission to
                    activate a trillion dollar opportunity.
                  </Highlight>
                </TextMd>

                <Button
                  as={Link}
                  href={EXTERNAL_HREF.MEZO_INFO}
                  isExternal
                  variant="link"
                  rightIcon={
                    <Icon as={IconArrowUpRight} boxSize={4} color="brand.400" />
                  }
                >
                  More info
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card px={5} py={4} bg="gold.300" borderWidth={0} rounded="xl">
            <CardHeader p={0} as={HStack} justify="space-between" mb={3}>
              <TextMd>Estimated chain launch</TextMd>
              <TextMd fontWeight="bold">Q4 2024</TextMd>
            </CardHeader>

            <CardBody p={0} as={HStack} spacing={3}>
              <Icon as={IconInfoCircle} color="gold.700" boxSize={6} />
              <TextMd textAlign="start">
                Acre is not in control of the chain’s launch date.
              </TextMd>
            </CardBody>
          </Card>

          <Card px={5} py={4} bg="green.100" borderWidth={0} rounded="xl">
            <CardBody p={0} as={HStack} spacing={3}>
              <Icon as={IconCircleCheckFilled} color="green.500" boxSize={6} />
              <TextMd textAlign="start">
                Acre users participate in Mezo points program automatically.
              </TextMd>
            </CardBody>
          </Card>
        </VStack>
      </ModalBody>
    </>
  )
}

const MezoBeehiveModal = withBaseModal(MezoBeehiveModalBase, { size: "lg" })
export default MezoBeehiveModal
