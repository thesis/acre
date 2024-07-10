import { beforeEach, describe, expect, it } from "vitest"
import { createActivity } from "#/tests/factories"
import { Activity } from "#/types"
import { WalletState } from "../wallet"
import reducer, {
  deleteLatestActivity,
  initialState,
  setActivities,
} from "../wallet/walletSlice"

const isSignedMessage = false
const pendingActivityId = "0"
const pendingActivity = createActivity({
  id: pendingActivityId,
  status: "pending",
})

const latestActivities = {
  [pendingActivityId]: pendingActivity,
}

const activities = [
  pendingActivity,
  createActivity({ id: "1" }),
  createActivity({ id: "2" }),
]

describe("Wallet redux slice", () => {
  describe("deposits", () => {
    let state: WalletState

    beforeEach(() => {
      state = {
        ...initialState,
        activities,
        latestActivities,
        isSignedMessage,
      }
    })

    it("should delete latest activity", () => {
      expect(reducer(state, deleteLatestActivity(pendingActivityId))).toEqual({
        ...initialState,
        activities,
        latestActivities: {},
        isSignedMessage,
      })
    })

    it("should update activities when the status of item changes", () => {
      const newActivities = [...activities]
      const completedActivity: Activity = {
        ...pendingActivity,
        status: "completed",
      }
      const foundIndex = newActivities.findIndex(
        ({ id }) => id === pendingActivityId,
      )
      newActivities[foundIndex] = completedActivity
      const newLatestActivities = {
        [pendingActivityId]: completedActivity,
      }

      expect(reducer(state, setActivities(newActivities))).toEqual({
        ...initialState,
        activities: newActivities,
        latestActivities: newLatestActivities,
        isSignedMessage,
      })
    })
  })

  describe("withdrawals", () => {
    let state: WalletState
    const pendingWithdrawActivityId =
      "0x047078deab9f2325ce5adc483d6b28dfb32547017ffb73f857482b51b622d5eb"
    const pendingWithdrawActivity = createActivity({
      id: pendingWithdrawActivityId,
      status: "pending",
      type: "withdraw",
    })

    const currentActivities = [
      createActivity({
        type: "withdraw",
        id: `${pendingWithdrawActivityId}-1`,
      }),
      createActivity({
        type: "withdraw",
        id: `${pendingWithdrawActivityId}-2`,
      }),
    ]

    const currentLatestActivities = {
      [pendingWithdrawActivityId]: pendingWithdrawActivity,
    }

    describe("when withdrawal is still pending", () => {
      const pendingWithdrawActivityWithFullId = {
        ...pendingWithdrawActivity,
        id: `${pendingWithdrawActivityId}-3`,
      }
      const newActivities = [
        ...currentActivities,
        pendingWithdrawActivityWithFullId,
      ]

      const expectedLatestActivities = {
        [pendingWithdrawActivityWithFullId.id]:
          pendingWithdrawActivityWithFullId,
      }
      beforeEach(() => {
        state = {
          ...initialState,
          activities: currentActivities,
          latestActivities: currentLatestActivities,
          isSignedMessage,
        }
      })

      it("should not update pending withdraw state and should set correct id", () => {
        expect(reducer(state, setActivities(newActivities))).toEqual({
          ...initialState,
          activities: newActivities,
          latestActivities: expectedLatestActivities,
          isSignedMessage,
        })
      })
    })
    describe("when withdrawal is already complete", () => {
      const withdrawActivityCompleted: Activity = {
        ...pendingWithdrawActivity,
        status: "completed",
        id: `${pendingWithdrawActivityId}-3`,
      }

      const newActivities = [...currentActivities, withdrawActivityCompleted]

      const expectedLatestActivities = {
        [withdrawActivityCompleted.id]: withdrawActivityCompleted,
      }

      beforeEach(() => {
        state = {
          ...initialState,
          activities: currentActivities,
          latestActivities: currentLatestActivities,
          isSignedMessage,
        }
      })

      it("should mark the latest pending withdraw activity as completed and save as latest activity", () => {
        expect(reducer(state, setActivities(newActivities))).toEqual({
          ...initialState,
          activities: newActivities,
          latestActivities: expectedLatestActivities,
          isSignedMessage,
        })
      })
    })
  })
})
