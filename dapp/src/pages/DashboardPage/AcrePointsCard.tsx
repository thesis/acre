import React from "react"
import { TextLg, TextMd, TextSm } from "#/components/shared/Typography"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Icon,
  Link,
  Tag,
  TagLeftIcon,
  VStack,
} from "@chakra-ui/react"
import acrePointsCardPlaceholderSrc from "#/assets/images/acre-points-card-placeholder.png"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import {
  IconArrowUpRight,
  IconPlayerTrackNextFilled,
} from "@tabler/icons-react"
import { EXTERNAL_HREF } from "#/constants"

export default function AcrePointsCard(props: CardProps) {
  return (
    <Card
      px="1.875rem" // 30px
      py={5}
      {...props}
    >
      <CardHeader p={0} mb={8}>
        <TextMd fontWeight="bold" color="grey.700" textAlign="center">
          Acre points
        </TextMd>
      </CardHeader>

      <CardBody p={0}>
        <UserDataSkeleton>
          <VStack
            bgImg={acrePointsCardPlaceholderSrc}
            bgSize="cover"
            spacing={0}
            pt={16}
            pb="8.5rem" // 136px (156px - y-axis padding)
          >
            <Tag px={3} py={1} bg="grey.700" color="gold.300" mb={6} border={0}>
              <TagLeftIcon as={IconPlayerTrackNextFilled} color="brand.300" />
              <TextSm
                textTransform="uppercase"
                fontWeight="bold"
                fontStyle="italic"
              >
                Coming soon
              </TextSm>
            </Tag>
            <TextLg color="grey.700" fontWeight="semibold">
              Acre Points will be live soon!
            </TextLg>
            <TextMd color="grey.500" fontWeight="medium">
              Stake now to secure your spot
            </TextMd>
            {/* TODO: Update `ButtonLink` component and 'link' Button theme variant */}
            <Button
              as={Link}
              href={`${EXTERNAL_HREF.DOCS}/acre-points-program`}
              isExternal
              variant="ghost"
              color="brand.400"
              iconSpacing={1}
              rightIcon={
                <Icon as={IconArrowUpRight} boxSize={4} color="brand.400" />
              }
              mt={4}
            >
              Read documentation
            </Button>
          </VStack>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
