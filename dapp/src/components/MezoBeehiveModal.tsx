import React from "react"
import {
  ModalBody,
  ModalHeader,
  HStack,
  VStack,
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
import { externalHref } from "#/constants"
import { numbersUtils } from "#/utils"
import { useMats } from "#/hooks"
import withBaseModal from "./ModalRoot/withBaseModal"

function MezoBeehiveModalBase() {
  const { data } = useMats()

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

      <ModalBody gap={6} pb={{ base: 0, sm: 8 }} overflowX="hidden">
        <VStack spacing={1}>
          {data && (
            <HStack>
              <H6 fontWeight="bold">
                {numbersUtils.numberToLocaleString(data.totalMats)}
              </H6>
              <TextLg fontWeight="bold">MATS</TextLg>
            </HStack>
          )}
          <TextLg>
            Acre users are automatically part of the Mezo Points program as a
            group.
          </TextLg>
        </VStack>

        <VStack>
          <Card
            gap={2}
            bg="grey.700"
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
            <CardHeader as={HStack}>
              <Icon as={IconChartPieFilled} color="brand.400" boxSize={5} />
            </CardHeader>

            <CardBody>
              <TextMd lineHeight={5}>
                In the event of a reward distribution, your share is calculated
                by deposit amount and duration, and you can claim it directly
                from Acre.
              </TextMd>
            </CardBody>
          </Card>

          <Card>
            <CardBody
              as={HStack}
              spacing={6}
              color="grey.700"
              textAlign="start"
            >
              <MezoSignIcon
                boxSize="5.5rem" // 88px
                rounded="lg"
              />
              <VStack align="start">
                <TextMd lineHeight={5}>
                  Mezo is the economic layer for Bitcoin with a mission to
                  activate a trillion dollar opportunity.
                </TextMd>

                <Button
                  as={Link}
                  href={externalHref.MEZO_INFO}
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
