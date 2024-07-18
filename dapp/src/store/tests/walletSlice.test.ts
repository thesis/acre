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
const hasFetchedActivities = true
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
        hasFetchedActivities,
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
        hasFetchedActivities,
      })
    })
  })

  describe("withdrawals", () => {
    let state: WalletState
    const pendingWithdrawRedemptionKey =
      "0x047078deab9f2325ce5adc483d6b28dfb32547017ffb73f857482b51b622d5eb"
    const pendingWithdrawActivity = createActivity({
      // After the successful withdrawal flow we set the id to redemption key
      // w/o the `-<count>` suffix because it's hard to get the exact number of
      // withdrawals with the same redemption key. There can only be one pending
      // withdrawal with the same redemption key at a time.
      id: pendingWithdrawRedemptionKey,
      status: "pending",
      type: "withdraw",
    })

    // Let's assume the user has already made 2 withdrawals and these 2
    // withdrawals have the same redemption key as the newly created. Both are
    // completed.
    const currentActivities = [
      createActivity({
        type: "withdraw",
        id: `${pendingWithdrawRedemptionKey}-1`,
      }),
      createActivity({
        type: "withdraw",
        id: `${pendingWithdrawRedemptionKey}-2`,
      }),
    ]

    // A user made a new withdrawal and the dapp saved the pending activity in
    // the store.
    const currentLatestActivities = {
      [pendingWithdrawRedemptionKey]: pendingWithdrawActivity,
    }

    describe("when withdrawal is still pending", () => {
      // This is our pending withdrawal but with the full id with the `-<count>`
      // suffix returned by backend.
      const pendingWithdrawActivityWithFullId = {
        ...pendingWithdrawActivity,
        id: `${pendingWithdrawRedemptionKey}-3`,
      }
      // The new data returned from the backend and they includes our pending
      // withdrawal.
      const newActivities = [
        ...currentActivities,
        pendingWithdrawActivityWithFullId,
      ]

      // We should replace the pending activity with the activity from the
      // backend that contains the full id (`<redemptionKey>-<count>`) and still
      // keep it in the `latestActivities` map.
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
          hasFetchedActivities,
        }
      })

      it("should not update pending withdraw state and should set correct id", () => {
        expect(reducer(state, setActivities(newActivities))).toEqual({
          ...initialState,
          activities: newActivities,
          latestActivities: expectedLatestActivities,
          isSignedMessage,
          hasFetchedActivities,
        })
      })
    })

    describe("when withdrawal is already complete", () => {
      const withdrawActivityCompleted: Activity = {
        ...pendingWithdrawActivity,
        status: "completed",
        id: `${pendingWithdrawRedemptionKey}-3`,
      }

      // Let's assume the pending withdrawal is already completed and the
      // backend returns it but with the full id. Note that the pending activity
      // is still in the `latestActivities` map but w/o the full id (id is
      // redemption key).
      const newActivities = [...currentActivities, withdrawActivityCompleted]

      // The dapp should update the state to `completed` and save this activity
      // in the latest activity map.
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
          hasFetchedActivities,
        })
      })
    })
  })
})
