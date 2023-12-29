import { deployments } from "hardhat"
import {
  SnapshotRestorer,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { getDeployedContract } from "./contract"

import type { Acre, Dispatcher, TestERC20 } from "../../typechain"

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

/**
 * Adds a beforeEach/afterEach hook pair to snapshot the EVM state before and
 * after each of tests in a test suite.
 */
export function beforeAfterEachSnapshotWrapper(): void {
  let snapshot: SnapshotRestorer

  beforeEach(async () => {
    snapshot = await takeSnapshot()
  })

  afterEach(async () => {
    await snapshot.restore()
  })
}

export async function deployment() {
  await deployments.fixture()

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const acre: Acre = await getDeployedContract("Acre")
  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")

  return { tbtc, acre, dispatcher }
}
