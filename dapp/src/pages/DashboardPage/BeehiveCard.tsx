import React from "react"
import { TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Highlight,
  Image,
} from "@chakra-ui/react"
import { ArrowUpRight, MezoSignIcon } from "#/assets/icons"
import { useModal } from "#/hooks"
import { MODAL_TYPES } from "#/types"
import mezoBeehiveCardIllustrationSrc from "#/assets/images/mezo-beehive-card-illustration.svg"

export default function BeehiveCard(props: CardProps) {
  const { openModal } = useModal()
  const handleOpenBeehiveModal = () => {
    openModal(MODAL_TYPES.MEZO_BEEHIVE)
  }

  return (
    <Card p={4} {...props}>
      <CardHeader p={0} mb={4}>
        <TextMd fontWeight="semibold" color="grey.500">
          Beehive
        </TextMd>
      </CardHeader>

      <CardBody p={0} mx={-4}>
        <Image src={mezoBeehiveCardIllustrationSrc} pl={4} mx="auto" mb={4} />

        <Card
          borderWidth={0}
          variant="elevated"
          colorScheme="gold"
          align="center"
          px={4}
          py={3}
          mx={4}
        >
          <CardHeader p={0} mb={1}>
            <TextMd fontWeight="semibold" color="grey.500">
              <Highlight
                query="Mezo"
                styles={{ fontWeight: "bold", color: "grey.700" }}
              >
                Collecting honey from Mezo
              </Highlight>

              <MezoSignIcon boxSize={5} rounded="full" ml={1} />
            </TextMd>
          </CardHeader>

          <CardBody p={0}>
            <Button
              onClick={() => handleOpenBeehiveModal()}
              variant="ghost"
              rightIcon={<ArrowUpRight />}
              iconSpacing={1}
              color="brand.400"
            >
              More info
            </Button>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  )
}
