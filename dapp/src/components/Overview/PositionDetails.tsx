import React from "react"
import { Button, Flex } from "@chakra-ui/react"
import { BITCOIN } from "../../constants"
import Staking from "../Staking"
import { useStakingFlowContext } from "../../hooks"
import { TokenBalance } from "../TokenBalance"
import { TextMd } from "../Typography"

export default function PositionDetails() {
  const { setModalType } = useStakingFlowContext()

  return (
    <>
      <Flex p={4} h="100%" direction="column" justifyContent="space-between">
        <Flex direction="column" gap={2}>
          <TextMd>Your positions</TextMd>
          {/* TODO: Use the real data */}
          <TokenBalance
            tokenBalance="132231212"
            currency={BITCOIN}
            usdBalance="1.245.148,1"
            alignItems="start"
          />
        </Flex>
        <Flex direction="column" gap={2}>
          {/* TODO: Handle click actions */}
          <Button onClick={() => setModalType("overview")}>Stake</Button>
          <Button variant="outline">Withdraw</Button>
        </Flex>
      </Flex>
      <Staking />
    </>
  )
}
