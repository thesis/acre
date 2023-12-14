import React, { useState } from "react"
import {
  Text,
  Button,
  Tooltip,
  Icon,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
} from "@chakra-ui/react"
import { BITCOIN, USD } from "../../constants"
import { Info } from "../../static/icons"
import StakingModal from "../StakingModal"

export default function PositionDetails(props: CardProps) {
  const [isOpenStakingModal, setIsOpenStakingModal] = useState(false)

  return (
    <Card {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <Text>Your positions</Text>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template">
            <Icon as={Info} color="grey.700" />
          </Tooltip>
        </HStack>
        <Text>
          34.75 <Text as="span">{BITCOIN.symbol}</Text>
        </Text>
        <Text>
          1.245.148,1 <Text as="span">{USD.symbol}</Text>
        </Text>
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button onClick={() => setIsOpenStakingModal(true)}>Stake</Button>
        <Button variant="outline">Withdraw</Button>
      </CardFooter>
      <StakingModal
        isOpen={isOpenStakingModal}
        onClose={() => setIsOpenStakingModal(false)}
      />
    </Card>
  )
}
