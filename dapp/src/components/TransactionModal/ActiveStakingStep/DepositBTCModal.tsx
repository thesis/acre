import React, { useCallback } from "react"
import { useDepositBTC, useModalFlowContext } from "#/hooks"
import Alert from "#/components/shared/Alert"
import { TextMd } from "#/components/shared/Typography"
import { asyncWrapper } from "#/utils"
import { PROCESS_STATUSES } from "#/types"
import StakingStepsModalContent from "./StakingStepsModalContent"

export default function DepositBTCModal() {
  const { setStatus } = useModalFlowContext()

  const onDepositSuccess = useCallback(() => {
    setStatus(PROCESS_STATUSES.LOADING)
  }, [setStatus])

  const { depositBTC } = useDepositBTC(onDepositSuccess)

  const handledDepositBTC = useCallback(() => {
    asyncWrapper(depositBTC())
  }, [depositBTC])

  return (
    <StakingStepsModalContent
      buttonText="Deposit BTC"
      activeStep={1}
      onClick={handledDepositBTC}
    >
      <Alert>
        <TextMd>
          Make a Bitcoin transaction to deposit and stake your BTC.
        </TextMd>
      </Alert>
    </StakingStepsModalContent>
  )
}
