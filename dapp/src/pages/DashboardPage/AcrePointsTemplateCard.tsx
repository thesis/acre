import React from "react"
import { TextLg, TextMd, TextSm } from "#/components/shared/Typography"
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Tag,
  TagLeftIcon,
  VStack,
} from "@chakra-ui/react"
import { acrePointsCardPlaceholder } from "#/assets/images"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import { IconPlayerTrackNextFilled } from "@tabler/icons-react"
import { externalHref } from "#/constants"
import LinkButton from "#/components/shared/LinkButton"

export default function AcrePointsTemplateCard(props: CardProps) {
  return (
    <Card
      px="1.875rem" // 30px
      {...props}
    >
      <CardHeader mb={8}>
        <TextMd>Acre points</TextMd>
      </CardHeader>

      <CardBody>
        <UserDataSkeleton>
          <VStack
            bgImg={acrePointsCardPlaceholder}
            bgSize="cover"
            spacing={0}
            pt={16}
            pb="8.5rem" // 136px (156px - y-axis padding)
          >
            <Tag
              px={3}
              py={1}
              bg="brown.100"
              color="surface.4"
              mb={6}
              border={0}
            >
              <TagLeftIcon
                as={IconPlayerTrackNextFilled}
                color="oldPalette.brand.300"
              />
              <TextSm
                textTransform="uppercase"
                fontWeight="bold"
                fontStyle="italic"
              >
                Coming soon
              </TextSm>
            </Tag>
            <TextLg color="text.primary" fontWeight="semibold">
              Acre Points will be live soon!
            </TextLg>
            <TextMd color="text.tertiary" fontWeight="medium">
              Stake now to secure your spot
            </TextMd>
            <LinkButton
              href={`${externalHref.DOCS}/acre-points-program`}
              isExternal
              mt={4}
            >
              Read documentation
            </LinkButton>
          </VStack>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
