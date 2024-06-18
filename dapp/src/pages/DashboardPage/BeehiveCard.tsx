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
import { ArrowUpRight, MezoSign } from "#/assets/icons"
import mezoBeehiveIlustrationSrc from "#/assets/images/mezo-beehive-ilustration.svg"

export default function BeehiveCard(props: CardProps) {
  return (
    <Card p={4} {...props}>
      <CardHeader p={0} mb={4}>
        <TextMd fontWeight="semibold" color="grey.500">
          Beehive
        </TextMd>
      </CardHeader>

      <CardBody p={0} mx={-4}>
        <Image src={mezoBeehiveIlustrationSrc} ml={4} mb={4} />

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
                styles={{ fontWeight: 700, color: "grey.700" }}
              >
                Collecting honey from Mezo
              </Highlight>

              <MezoSign boxSize={5} rounded="full" ml={1} />
            </TextMd>
          </CardHeader>

          <CardBody p={0}>
            <Button
              variant="link"
              rightIcon={<ArrowUpRight />}
              iconSpacing={1}
              color="brand.400"
              justifyContent="center"
              textDecoration="none"
              fontWeight="semibold"
              lineHeight={5}
            >
              More info
            </Button>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  )
}
