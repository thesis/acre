import React from "react"
import { H6, TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Flex,
  Grid,
  Highlight,
  HStack,
  Image,
  VStack,
} from "@chakra-ui/react"
import { ArrowUpRight, MatsIcon, MezoSignIcon } from "#/assets/icons"
import { useMats, useIsFetchedWalletData, useModal } from "#/hooks"
import { MODAL_TYPES } from "#/types"
import beehiveIllustrationSrc from "#/assets/images/beehive-illustration.svg"
import mezoBeesIllustrationSrc from "#/assets/images/mezo-bees.svg"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import { numberToLocaleString } from "#/utils"
import InfoTooltip from "#/components/shared/InfoTooltip"

export default function BeehiveCard(props: CardProps) {
  const { openModal } = useModal()
  const isFetchedWalletData = useIsFetchedWalletData()
  const { data } = useMats()

  const handleOpenBeehiveModal = () => {
    openModal(MODAL_TYPES.MEZO_BEEHIVE)
  }

  return (
    <Card p={4} {...props}>
      <CardHeader
        p={0}
        as={Flex}
        alignItems="center"
        justify="space-between"
        gap={2}
      >
        <TextMd fontWeight="bold" color="grey.700">
          Additional rewards
        </TextMd>
        <InfoTooltip
          label="Acre Beehive automatically collects rewards from our partner projects. Rewards are dropped daily, and your share is calculated based on your deposit amount and how long you HODL."
          w={56}
        />
      </CardHeader>

      <CardBody p={0}>
        <Grid
          gridAutoFlow="column"
          alignItems="center"
          justifyContent="space-between"
        >
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
        </Grid>

        <UserDataSkeleton mt={4}>
          <Card
            borderWidth={0}
            variant="elevated"
            colorScheme="gold"
            align="center"
            px={4}
            py={5}
            gap={1}
          >
            <CardHeader p={0} mb={1}>
              <Flex alignItems="center">
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
                    Total collected mats from Mezo
                  </Highlight>
                </TextMd>

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
              </Flex>
            </CardHeader>

            <CardBody as={VStack} p={0}>
              {data && (
                <HStack align="baseline">
                  <H6 fontWeight="bold">
                    {numberToLocaleString(data.totalMats)}
                  </H6>
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
