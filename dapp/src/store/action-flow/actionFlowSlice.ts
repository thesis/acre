import { ActionFlowType, PROCESS_STATUSES, ProcessStatus } from "#/types"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type ActionFlowState = {
  type: ActionFlowType
  activeStep: number
  status: ProcessStatus
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

export const { setType, setStatus, goNextStep, resetState } =
  actionFlowSlice.actions
