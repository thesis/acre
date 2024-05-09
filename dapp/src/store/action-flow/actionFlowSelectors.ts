import { ActionFlowType, ProcessStatus } from "#/types"
import { RootState } from ".."

export const selectActionFlowType = (state: RootState): ActionFlowType =>
  state.actionFlow.type

export const selectActionFlowActiveStep = (state: RootState): number =>
  state.actionFlow.activeStep

export const selectActionFlowStatus = (state: RootState): ProcessStatus =>
  state.actionFlow.status
