import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  CardProps,
  HStack,
  Icon,
} from "@chakra-ui/react"
import { IconDiscountCheckFilled, IconLock } from "@tabler/icons-react"
import { TextMd } from "#/components/shared/Typography"
import UserDataSkeleton from "#/components/shared/UserDataSkeleton"

export default function GrantedSeasonPassCard(props: CardProps) {
  return (
    <Card size="md" px={5} py={4} gap={4} {...props}>
      <UserDataSkeleton>
        <CardHeader as={HStack} spacing={1} alignItems="normal" p={0}>
          <TextMd fontWeight="bold">Season 2 arriving soon</TextMd>
          <Icon as={IconLock} boxSize={5} />
        </CardHeader>
      </UserDataSkeleton>
      <UserDataSkeleton w="60%">
        <CardBody
          as={HStack}
          spacing={2}
          alignItems="center"
          color="green.400"
          p={0}
        >
          <Icon as={IconDiscountCheckFilled} boxSize={5} />
          <TextMd fontWeight="semibold">Your seat is secured.</TextMd>
        </CardBody>
      </UserDataSkeleton>
    </Card>
  )
}
