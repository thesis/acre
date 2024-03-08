import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Button,
  CardBody,
  Card,
  CardFooter,
  HStack,
  CardProps,
  useDisclosure,
  Icon,
} from "@chakra-ui/react"
import { CurrencyBalanceWithConversion } from "#/components/shared/CurrencyBalanceWithConversion"
import { TextMd } from "#/components/shared/Typography"
import { ACTION_FLOW_TYPES, ActionFlowType } from "#/types"
import TransactionModal from "#/components/TransactionModal"
import { StakingTokenPopover } from "#/components/StakingTokenPopover"
import { Info } from "#/assets/icons"

export default function PositionDetails(props: CardProps) {
  const { isOpen, onToggle, onClose } = useDisclosure()
  const cardRef = useRef<HTMLDivElement>()
  const [cardWidth, setCardWidth] = useState<number>(0)

  const onResize = () => {
    if (cardRef?.current?.clientWidth) {
      setCardWidth(cardRef.current.clientWidth)
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  const [actionFlowType, setActionFlowType] = useState<
    ActionFlowType | undefined
  >(undefined)

  const handleCloseTransactionModal = useCallback(() => {
    setActionFlowType(undefined)
  }, [])

  return (
    <Card ref={cardRef} position="relative" {...props}>
      <CardBody>
        <HStack justifyContent="space-between">
          <TextMd fontWeight="bold">Your position</TextMd>
          <Icon as={Info} color="grey.700" onClick={onToggle} />
          <StakingTokenPopover
            isOpen={isOpen}
            onClose={onClose}
            closeOnBlur={false}
            placement="left-start"
            width={cardWidth}
          />
        </HStack>
        <CurrencyBalanceWithConversion
          from={{
            currency: "bitcoin",
            amount: "2398567898",
            variant: "greater-balance-xl",
            symbolFontWeight: "semibold",
          }}
          to={{
            currency: "usd",
            size: "lg",
          }}
        />
      </CardBody>
      <CardFooter flexDirection="column" gap={2}>
        <Button
          size="lg"
          onClick={() => setActionFlowType(ACTION_FLOW_TYPES.STAKE)}
        >
          Stake
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setActionFlowType(ACTION_FLOW_TYPES.UNSTAKE)}
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
