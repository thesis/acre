import React from "react"
import { H6, TextLg, TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Flex,
  Highlight,
  HStack,
  Image,
  VStack,
} from "@chakra-ui/react"
import { ArrowUpRight, MatsIcon, MezoSignIcon } from "#/assets/icons"
import { useAcreMats, useIsFetchedWalletData, useModal } from "#/hooks"
import { MODAL_TYPES } from "#/types"
import beehiveIllustrationSrc from "#/assets/images/beehive-illustration.svg"
import mezoBeesIllustrationSrc from "#/assets/images/mezo-bees.svg"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import { numberToLocaleString } from "#/utils"

export default function BeehiveCard(props: CardProps) {
  const { openModal } = useModal()
  const isFetchedWalletData = useIsFetchedWalletData()
  const { data } = useAcreMats()

  const handleOpenBeehiveModal = () => {
    openModal(MODAL_TYPES.MEZO_BEEHIVE)
  }

  return (
    <Card p={4} {...props}>
      <CardHeader p={0}>
        <TextMd fontWeight="bold" color="grey.700">
          Beehive
        </TextMd>
      </CardHeader>

      <CardBody p={0}>
        <HStack justifyContent="space-between">
          {isFetchedWalletData ? (
            <Image
              src={mezoBeesIllustrationSrc}
              w="full"
              maxW="24.75rem" // 396px
              mx="auto"
            />
          ) : (
            <UserDataSkeleton boxSize={24} rounded="100%" />
          )}
          <Image src={beehiveIllustrationSrc} />
        </HStack>

        <UserDataSkeleton mt={4}>
          <Card
            borderWidth={0}
            variant="elevated"
            colorScheme="gold"
            align="center"
            px={4}
            py={3}
            gap={1}
          >
            <CardHeader p={0} mb={1}>
              <TextMd
                fontWeight="semibold"
                color="grey.500"
                display="flex"
                whiteSpace="pre"
                alignItems="center"
              >
                <Highlight
                  query="Mezo"
                  styles={{ fontWeight: "bold", color: "grey.700" }}
                >
                  Collecting mats from Mezo
                </Highlight>

                <Flex display="inline-flex" ml={1}>
                  <MezoSignIcon boxSize={5} rounded="full" />
                  <MatsIcon
                    boxSize={5}
                    rounded="full"
                    ml={-1}
                    ring={1}
                    ringColor="gold.100"
                  />
                </Flex>
              </TextMd>
            </CardHeader>

            <CardBody as={VStack} p={0}>
              {data && (
                <HStack>
                  <H6 fontWeight="bold">
                    {numberToLocaleString(data.totalMats, 0)}
                  </H6>
                  <TextLg fontWeight="bold">MATS</TextLg>
                </HStack>
              )}

              <Button
                onClick={() => handleOpenBeehiveModal()}
                variant="ghost"
                rightIcon={<ArrowUpRight />}
                color="brand.400"
                iconSpacing={1}
                p={0}
                h="auto"
                lineHeight={5}
              >
                More info
              </Button>
            </CardBody>
          </Card>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
