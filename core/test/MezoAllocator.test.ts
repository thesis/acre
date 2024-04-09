import { helpers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"

import {
  StBTC as stBTC,
  TestERC20,
  MezoAllocator,
  IMezoPortal,
} from "../typechain"

import { to1e18 } from "./utils"

const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { tbtc, stbtc, mezoAllocator, mezoPortal } = await deployment()
  const { governance, maintainer } = await getNamedSigners()
  const [thirdParty] = await getUnnamedSigners()

  return {
    governance,
    thirdParty,
    maintainer,
    tbtc,
    stbtc,
    mezoAllocator,
    mezoPortal,
  }
}

describe("MezoAllocator", () => {
  let tbtc: TestERC20
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let mezoPortal: IMezoPortal

  let thirdParty: HardhatEthersSigner
  let maintainer: HardhatEthersSigner

  before(async () => {
    ;({ thirdParty, maintainer, tbtc, stbtc, mezoAllocator, mezoPortal } =
      await loadFixture(fixture))
  })

  describe("allocate", () => {
    beforeAfterSnapshotWrapper()

    context("when a caller is not a maintainer", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).allocate(),
        ).to.be.revertedWithCustomError(mezoAllocator, "NotAuthorized")
      })
    })

    context("when the caller is maintainer", () => {
      context("when a first deposit is made", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), to1e18(6))
          tx = await mezoAllocator.connect(maintainer).allocate()
        })

        it("should deposit and transfer tBTC to Mezo Portal", async () => {
          expect(await tbtc.balanceOf(await mezoPortal.getAddress())).to.equal(
            to1e18(6),
          )
        })

        it("should not store any tBTC in Mezo Allocator", async () => {
          expect(
            await tbtc.balanceOf(await mezoAllocator.getAddress()),
          ).to.equal(0)
        })

        it("should increment the deposit id", async () => {
          const actualDepositId = await mezoAllocator.depositId()
          expect(actualDepositId).to.equal(1)
        })

        it("should emit DepositAllocated event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(0, 1, to1e18(6), to1e18(6))
        })
      })

      context("when a second deposit is made", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), to1e18(5))

          tx = await mezoAllocator.connect(maintainer).allocate()
        })

        it("should increment the deposit id", async () => {
          const actualDepositId = await mezoAllocator.depositId()
          expect(actualDepositId).to.equal(2)
        })

        it("should emit DepositAllocated event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(1, 2, to1e18(5), to1e18(11))
        })

        it("should deposit and transfer tBTC to Mezo Portal", async () => {
          expect(await tbtc.balanceOf(await mezoPortal.getAddress())).to.equal(
            to1e18(11),
          )
        })

        it("should increase tracked deposit balance amount", async () => {
          const depositBalance = await mezoAllocator.depositBalance()
          expect(depositBalance).to.equal(to1e18(11))
        })
      })
    })
  })
})
