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
    <Card size="md" gap={4} {...props}>
      <UserDataSkeleton>
        <CardHeader as={HStack} spacing={1} alignItems="normal">
          <TextMd>Season 2 arriving soon</TextMd>
          <Icon as={IconLock} boxSize={5} />
        </CardHeader>
      </UserDataSkeleton>
      <UserDataSkeleton w="80%">
        <CardBody as={HStack} spacing={2} alignItems="center" color="green.400">
          <Icon as={IconDiscountCheckFilled} boxSize={5} />
          <TextMd fontWeight="semibold">Your seat is secured.</TextMd>
        </CardBody>
      </UserDataSkeleton>
    </Card>
  )
}
