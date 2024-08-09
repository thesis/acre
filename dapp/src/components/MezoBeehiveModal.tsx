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
  Link,
  Flex,
} from "@chakra-ui/react"
import { H6, TextLg, TextMd, TextXl } from "#/components/shared/Typography"
import { AcreSignIcon, MatsIcon, MezoSignIcon } from "#/assets/icons"
import { IconArrowUpRight, IconChartPieFilled } from "@tabler/icons-react"
import { EXTERNAL_HREF } from "#/constants"
import { numberToLocaleString } from "#/utils"
import withBaseModal from "./ModalRoot/withBaseModal"
import { useAcreMats } from "#/hooks"

function MezoBeehiveModalBase() {
  const { data } = useAcreMats()

  return (
    <>
      <ModalCloseButton />
      <ModalHeader as={VStack} spacing={2.5} px={8} pt={8} pb={2.5}>
        <TextXl fontWeight="bold">Acre & Mezo</TextXl>
        <Flex alignItems="center">
          <AcreSignIcon boxSize={10} rounded="full" />
          <MatsIcon
            mx={-2}
            boxSize="3.75rem" // 60px
            ring={0.5}
            ringColor="gold.100"
            rounded="full"
          />
          <MezoSignIcon boxSize={10} rounded="full" zIndex={-1} />
        </Flex>
      </ModalHeader>

      <ModalBody gap={6} pb={8} overflowX="hidden">
        <VStack spacing={1}>
          {data && (
            <HStack>
              <H6 fontWeight="bold">
                {numberToLocaleString(data.totalMats, 0)}
              </H6>
              <TextLg fontWeight="bold">MATS</TextLg>
            </HStack>
          )}
          <TextLg>
            <Highlight query="Mezo Points" styles={{ fontWeight: 700 }}>
              Acre users participate in Mezo points program automatically as a
              group.
            </Highlight>
          </TextLg>
        </VStack>

        <VStack>
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
            mt={2}
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

          <Card bg="gold.200" borderWidth={0} rounded="xl">
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
                  textDecorationLine="none"
                  rightIcon={
                    <Icon as={IconArrowUpRight} boxSize={4} color="brand.400" />
                  }
                >
                  More info
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </ModalBody>
    </>
  )
}

const MezoBeehiveModal = withBaseModal(MezoBeehiveModalBase, { size: "lg" })
export default MezoBeehiveModal
