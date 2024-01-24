import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { MaxUint256 } from "ethers"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { deployment } from "./helpers/context"
import { getNamedSigner } from "./helpers/signer"

import type { Acre, Dispatcher, TestERC20 } from "../typechain"

async function fixture() {
  const { tbtc, acre, dispatcher } = await deployment()
  const { governance, maintainer, treasury } = await getNamedSigner()

  return { acre, dispatcher, tbtc, governance, maintainer, treasury }
}

describe("Deployment", () => {
  let acre: Acre
  let dispatcher: Dispatcher
  let tbtc: TestERC20
  let maintainer: HardhatEthersSigner
  let treasury: HardhatEthersSigner

  before(async () => {
    ;({ acre, dispatcher, tbtc, maintainer, treasury } =
      await loadFixture(fixture))
  })

  describe("Acre", () => {
    describe("constructor", () => {
      context("when treasury has been set", () => {
        it("should be set to a treasury address", async () => {
          const actualTreasury = await acre.treasury()

          expect(actualTreasury).to.be.equal(await treasury.getAddress())
        })
      })
    })

    describe("updateDispatcher", () => {
      context("when a dispatcher has been set", () => {
        it("should be set to a dispatcher address by the deployment script", async () => {
          const actualDispatcher = await acre.dispatcher()

          expect(actualDispatcher).to.be.equal(await dispatcher.getAddress())
        })

        it("should approve max amount for the dispatcher", async () => {
          const actualDispatcher = await acre.dispatcher()
          const allowance = await tbtc.allowance(
            await acre.getAddress(),
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
