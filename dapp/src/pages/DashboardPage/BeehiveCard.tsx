import React from "react"
import { TextMd } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Highlight,
  HStack,
  Image,
} from "@chakra-ui/react"
import { ArrowUpRight, MezoSignIcon } from "#/assets/icons"
import { useIsSignedMessage, useModal } from "#/hooks"
import { MODAL_TYPES } from "#/types"
import mezoBeehiveCardIllustrationSrc from "#/assets/images/mezo-beehive-card-illustration.svg"
import beehiveIllustrationSrc from "#/assets/images/beehive-illustration.svg"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"

const MARGIN = 4

export default function BeehiveCard(props: CardProps) {
  const { openModal } = useModal()
  const isSignedMessage = useIsSignedMessage()

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

      <CardBody p={0} mx={-MARGIN}>
        {isSignedMessage ? (
          <Image
            src={mezoBeehiveCardIllustrationSrc}
            pl={MARGIN}
            w="full"
            maxW="24.75rem" // 396px
            mx="auto"
          />
        ) : (
          <HStack justifyContent="space-between" pl={MARGIN}>
            <UserDataSkeleton boxSize={24} rounded="100%" />
            <Image src={beehiveIllustrationSrc} />
          </HStack>
        )}

        <UserDataSkeleton mx={MARGIN} mt={4}>
          <Card
            borderWidth={0}
            variant="elevated"
            colorScheme="gold"
            align="center"
            px={4}
            py={3}
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
