import React, { useCallback, useState } from "react"
import {
  Button,
  Tooltip,
  Icon,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
} from "@chakra-ui/react"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { TextMd } from "#/components/shared/Typography"
import { Info } from "#/assets/icons"
import { ActionFlowType } from "#/types"
import TransactionModal from "../TransactionModal"

export default function PositionDetails(props: CardProps) {
  const [actionFlowType, setActionFlowType] = useState<
    ActionFlowType | undefined
  >(undefined)

  const handleCloseTransactionModal = useCallback(() => {
    setActionFlowType(undefined)
  }, [])

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
        <Button size="lg" onClick={() => setActionFlowType("STAKE")}>
          Stake
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setActionFlowType("UNSTAKE")}
        >
          Unstake
        </Button>
      </CardFooter>
      <TransactionModal
        isOpen={!!actionFlowType}
        defaultType={actionFlowType}
        onClose={handleCloseTransactionModal}
      />
    </Card>
  )
}
