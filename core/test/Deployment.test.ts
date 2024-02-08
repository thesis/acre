import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { MaxUint256 } from "ethers"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { deployment } from "./helpers/context"
import { getNamedSigner } from "./helpers/signer"

import type { StBTC as stBTC, Dispatcher, TestERC20 } from "../typechain"

async function fixture() {
  const { tbtc, stbtc, dispatcher } = await deployment()
  const { governance, maintainer, treasury } = await getNamedSigner()

  return { stbtc, dispatcher, tbtc, governance, maintainer, treasury }
}

describe("Deployment", () => {
  let stbtc: stBTC
  let dispatcher: Dispatcher
  let tbtc: TestERC20
  let maintainer: HardhatEthersSigner
  let treasury: HardhatEthersSigner

  before(async () => {
    ;({ stbtc, dispatcher, tbtc, maintainer, treasury } =
      await loadFixture(fixture))
  })

  describe("stBTC", () => {
    describe("constructor", () => {
      context("when treasury has been set", () => {
        it("should be set to a treasury address", async () => {
          const actualTreasury = await stbtc.treasury()

          expect(actualTreasury).to.be.equal(await treasury.getAddress())
        })
      })

      context("when rewardsCycleLength has been set", () => {
        it("should be set to a rewardsCycleLength", async () => {
          const actualRewardsCycleLength = await stbtc.rewardsCycleLength()

          expect(actualRewardsCycleLength).to.be.equal(7 * 24 * 60 * 60)
        })
      })
    })

    describe("updateDispatcher", () => {
      context("when a dispatcher has been set", () => {
        it("should be set to a dispatcher address by the deployment script", async () => {
          const actualDispatcher = await stbtc.dispatcher()

          expect(actualDispatcher).to.be.equal(await dispatcher.getAddress())
        })

        it("should approve max amount for the dispatcher", async () => {
          const actualDispatcher = await stbtc.dispatcher()
          const allowance = await tbtc.allowance(
            await stbtc.getAddress(),
            actualDispatcher,
          )

          expect(allowance).to.be.equal(MaxUint256)
        })
      })
    })
  })

  describe("Dispatcher", () => {
    describe("updateMaintainer", () => {
      context("when a new maintainer has been set", () => {
        it("should be set to a new maintainer address", async () => {
          const actualMaintainer = await dispatcher.maintainer()

          expect(actualMaintainer).to.be.equal(await maintainer.getAddress())
        })
      })
    })
  })
})
