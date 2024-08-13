import React from "react"
import { TextMd, TextXl } from "#/components/shared/Typography"
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Flex,
  HStack,
  Icon,
  Tag,
  TagLabel,
} from "@chakra-ui/react"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"
import useAcrePoints from "#/hooks/useAcrePoints"
import ButtonLink from "#/components/shared/ButtonLink"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { isWithinPeriod } from "#/utils"
import { ONE_SEC_IN_MILLISECONDS, ONE_WEEK_IN_SECONDS } from "#/constants"

type AcreRankCardProps = CardProps & {
  withTrendingIcon?: boolean
}

export default function AcreRankCard(props: AcreRankCardProps) {
  const { withTrendingIcon = true, ...restProps } = props

  const { data } = useAcrePoints()

  const hasClaimedLastWeek = isWithinPeriod(
    data.lastClaimedTimestamp,
    ONE_WEEK_IN_SECONDS * ONE_SEC_IN_MILLISECONDS,
  )
  const isRankTrendingUp = data.estimatedRankPosition > data.rankPosition

  return (
    <Card
      px="1.875rem" // 30px
      py={5}
      {...restProps}
    >
      <CardHeader p={0} mb={5} as={Flex} justify="space-between">
        <TextMd fontWeight="bold" color="grey.700">
          Your rank
        </TextMd>

        <ButtonLink
          variant="link"
          href="/leaderboard"
          color="brand.400"
          textDecorationLine="none"
          fontWeight="medium"
          fontSize="md"
        >
          Leaderboard
        </ButtonLink>
      </CardHeader>

      <CardBody
        py={0}
        px={3}
        _after={{
          content: '""',
          bg: "gold.100",
          roundedBottom: "lg",
          display: "block",
          w: "full",
          h: 3,
        }}
      >
        <UserDataSkeleton mx={-3}>
          <HStack
            px={6}
            py={5}
            justify="space-between"
            rounded="lg"
            bg="gold.300"
          >
            <HStack spacing={1}>
              <TextXl fontWeight="bold">#{data.estimatedRankPosition}</TextXl>

              {withTrendingIcon && hasClaimedLastWeek && (
                <Icon
                  as={isRankTrendingUp ? IconTrendingUp : IconTrendingDown}
                  color={isRankTrendingUp ? "green.500" : "red.400"}
                  boxSize={6}
                />
              )}
            </HStack>

            <HStack>
              <TextXl fontWeight="semibold">{data.userName}</TextXl>

              <Tag px={3} py={1} bg="gold.200" borderColor="gold.100">
                <TagLabel
                  color="grey.700"
                  fontWeight="semibold"
                  lineHeight="sm"
                >
                  #{data.rankPosition}
                </TagLabel>
              </Tag>
            </HStack>
          </HStack>
        </UserDataSkeleton>
      </CardBody>
    </Card>
  )
}
