/* eslint-disable import/prefer-default-export */
import {
  SnapshotRestorer,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"

/**
 * Adds a before/after hook pair to snapshot the EVM state before and after tests
 * in a test suite.
 */
export function beforeAfterSnapshotWrapper(): void {
  let snapshot: SnapshotRestorer

  before(async () => {
    snapshot = await takeSnapshot()
  })

  after(async () => {
    await snapshot.restore()
  })
}
