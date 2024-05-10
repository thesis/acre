import {
  ActionFlowType,
  PROCESS_STATUSES,
  ProcessStatus,
  TokenAmount,
} from "#/types"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type ActionFlowState = {
  type: ActionFlowType
  activeStep: number
  status: ProcessStatus
  tokenAmount?: TokenAmount
}

const initialState: ActionFlowState = {
  type: "stake",
  activeStep: 1,
  status: PROCESS_STATUSES.IDLE,
}

export const actionFlowSlice = createSlice({
  name: "action-flow",
  initialState,
  reducers: {
    setType(state, action: PayloadAction<ActionFlowType>) {
      state.type = action.payload
    },
    setActiveStep(state, action: PayloadAction<number>) {
      state.activeStep = action.payload
    },
    setStatus(state, action: PayloadAction<ProcessStatus>) {
      state.status = action.payload
    },
    setTokenAmount(state, action: PayloadAction<TokenAmount | undefined>) {
      state.tokenAmount = action.payload
    },
    goNextStep(state) {
      state.activeStep += 1
    },
    resetState(state) {
      state.type = initialState.type
      state.activeStep = initialState.activeStep
      state.status = initialState.status
    },
  },
})

export const { setType, setStatus, setTokenAmount, goNextStep, resetState } =
  actionFlowSlice.actions
