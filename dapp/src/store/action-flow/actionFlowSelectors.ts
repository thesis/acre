import { ActionFlowType, ProcessStatus, TokenAmount } from "#/types"
import { RootState } from ".."

export const selectActionFlowType = (state: RootState): ActionFlowType =>
  state.actionFlow.type

export const selectActionFlowActiveStep = (state: RootState): number =>
  state.actionFlow.activeStep

export const selectActionFlowStatus = (state: RootState): ProcessStatus =>
  state.actionFlow.status

export const selectActionFlowTokenAmount = (
  state: RootState,
): TokenAmount | undefined => state.actionFlow.tokenAmount
