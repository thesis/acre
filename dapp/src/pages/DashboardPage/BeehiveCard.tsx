import React from "react"
import { H6, TextMd, TextSm } from "#/components/shared/Typography"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Flex,
  Heading,
  Highlight,
  Image,
  VStack,
} from "@chakra-ui/react"
import { MezoSignIcon } from "#/assets/icons"
import { useMats, useModal } from "#/hooks"
import { MODAL_TYPES } from "#/types"
import beehiveIllustrationSrc from "#/assets/images/beehive-illustration.svg"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import { numberToLocaleString } from "#/utils"
import InfoTooltip from "#/components/shared/InfoTooltip"

export default function BeehiveCard(props: CardProps) {
  const { openModal } = useModal()
  const { data } = useMats()

  const handleOpenBeehiveModal = () => {
    openModal(MODAL_TYPES.MEZO_BEEHIVE)
  }

  return (
    <Card {...props}>
      <CardHeader as={Flex} alignItems="center" justify="space-between" gap={2}>
        <TextMd>Additional rewards</TextMd>
        <InfoTooltip
          label="Acre Beehive automatically collects rewards from our partner projects. Rewards are dropped daily, and your share is calculated based on your deposit amount and how long you HODL."
          w={56}
        />
      </CardHeader>

      <CardBody as={VStack}>
        <Image src={beehiveIllustrationSrc} boxSize={32} />
        <UserDataSkeleton w="100%" mt={-7}>
          <Box px={4} py={3} bg="gold.100" borderRadius="lg">
            <Flex gap={1} flexDirection="row">
              <TextSm>
                <Highlight query="Mezo" styles={{ color: "mezo" }}>
                  Total collected mats from Mezo
                </Highlight>
              </TextSm>
              <MezoSignIcon boxSize={5} rounded="full" />
            </Flex>
            {data && (
              <H6 fontWeight="semibold" color="grey.700">
                {numberToLocaleString(data.totalMats)}
              </H6>
            )}
            <Button mt={4} variant="outline" onClick={handleOpenBeehiveModal}>
              Read more
            </Button>
          </Box>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
