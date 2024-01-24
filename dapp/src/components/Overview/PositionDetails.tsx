import React from "react"
import {
  Button,
  Tooltip,
  Icon,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
  useBoolean,
} from "@chakra-ui/react"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { TextMd } from "#/components/shared/Typography"
import { Info } from "#/assets/icons"
import StakingModal from "../Modals/Staking"

export default function PositionDetails(props: CardProps) {
  const [isOpenStakingModal, stakingModal] = useBoolean()

  return (
    <Card {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <TextMd fontWeight="bold">Your position</TextMd>
          {/* TODO: Add correct text for tooltip */}
          <Tooltip label="Template" placement="top">
            <Icon as={Info} color="grey.700" />
          </Tooltip>
        </HStack>
        <CurrencyBalanceWithConversion
          from={{
            currency: "bitcoin",
            amount: "2398567898",
            variant: "greater-balance",
          }}
          to={{
            currency: "usd",
            size: "lg",
          }}
        />
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        {/* TODO: Handle click actions */}
        <Button size="lg" onClick={stakingModal.on}>
          Stake
        </Button>
        <Button size="lg" variant="outline">
          Unstake
        </Button>
      </CardFooter>
      <StakingModal isOpen={isOpenStakingModal} onClose={stakingModal.off} />
    </Card>
  )
}
