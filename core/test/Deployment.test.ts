import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
// import { MaxUint256 } from "ethers"
import { helpers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { deployment } from "./helpers/context"

import type { StBTC as stBTC } from "../typechain"

const { getNamedSigners } = helpers.signers

async function fixture() {
  const { stbtc } = await deployment()
  const { governance, treasury } = await getNamedSigners()

  return { stbtc, governance, treasury }
}

describe("Deployment", () => {
  let stbtc: stBTC
  let treasury: HardhatEthersSigner

  before(async () => {
    ;({ stbtc, treasury } = await loadFixture(fixture))
  })

  describe("Acre", () => {
    describe("constructor", () => {
      context("when treasury has been set", () => {
        it("should be set to a treasury address", async () => {
          const actualTreasury = await stbtc.treasury()

          expect(actualTreasury).to.be.equal(await treasury.getAddress())
        })
      })
    })

    // TODO: Uncomment and replace with MezoAllocator in the following PRs
    // describe("updateDispatcher", () => {
    //   context("when a dispatcher has been set", () => {
    //     it("should be set to a dispatcher address by the deployment script", async () => {
    //       const actualDispatcher = await stbtc.dispatcher()

    //       expect(actualDispatcher).to.be.equal(await dispatcher.getAddress())
    //     })

    //     it("should approve max amount for the dispatcher", async () => {
    //       const actualDispatcher = await stbtc.dispatcher()
    //       const allowance = await tbtc.allowance(
    //         await stbtc.getAddress(),
    //         actualDispatcher,
    //       )

    //       expect(allowance).to.be.equal(MaxUint256)
    //     })
    //   })
    // })
  })
})
