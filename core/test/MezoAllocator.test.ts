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
  const { tbtc, stbtc, dispatcher, mezoAllocator, mezoPortal } =
    await deployment()
  const { governance, maintainer } = await getNamedSigners()
  const [thirdParty] = await getUnnamedSigners()

  return {
    dispatcher,
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

  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let maintainer: HardhatEthersSigner

  before(async () => {
    ;({
      governance,
      thirdParty,
      maintainer,
      tbtc,
      stbtc,
      mezoAllocator,
      mezoPortal,
    } = await loadFixture(fixture))
  })

  describe("allocate", () => {
    beforeAfterSnapshotWrapper()

    context("when the caller is not an owner", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).allocate(to1e18(1)),
        ).to.be.revertedWithCustomError(mezoAllocator, "NotAuthorized")
      })
    })

    context("when the caller is an owner", () => {
      it("should not revert", async () => {
        await expect(
          mezoAllocator.connect(governance).allocate(to1e18(1)),
        ).to.not.be.revertedWithCustomError(mezoAllocator, "NotAuthorized")
      })
    })

    context("when the caller is maintainer", () => {
      context("when first deposit is made", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), to1e18(1))
          await mezoAllocator
            .connect(governance)
            .updateMaintainer(maintainer.address)

          tx = await mezoAllocator.connect(maintainer).allocate(to1e18(1))
        })

        it("should deposit and transfer tBTC to Mezo Portal", async () => {
          expect(
            await tbtc.balanceOf(await mezoAllocator.getAddress()),
          ).to.equal(0)
          expect(await tbtc.balanceOf(await mezoPortal.getAddress())).to.equal(
            to1e18(1),
          )
        })

        it("should populate deposits array", async () => {
          expect(await mezoAllocator.deposits(0)).to.equal(1)
        })

        it("should set deposit balance", async () => {
          const deposit = await mezoAllocator.depositsById(1)
          expect(deposit.balance).to.equal(to1e18(1))
        })

        it("should set creation timestamp", async () => {
          const deposit = await mezoAllocator.depositsById(1)
          const dateTime = new Date()
          // Check if the block timestamp is within 60 seconds of the current
          // test time
          expect(deposit.createdAt).to.be.closeTo(
            String(dateTime.valueOf()).slice(0, -3),
            60,
          )
        })

        it("should set unlocking timestamp", async () => {
          const deposit = await mezoAllocator.depositsById(1)
          const dateTime = new Date()
          // Check if the block timestamp is within 60 seconds of the current
          // test time
          expect(deposit.unlockAt).to.be.closeTo(
            String(dateTime.valueOf()).slice(0, -3),
            60,
          )
        })

        it("should emit Deposit event", async () => {
          const latestDepositId = await mezoAllocator.deposits(0)
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(latestDepositId, to1e18(1))
        })
      })

      context("when second deposit is made", () => {
        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), to1e18(5))
          await mezoAllocator
            .connect(governance)
            .updateMaintainer(maintainer.address)

          await mezoAllocator.connect(maintainer).allocate(to1e18(5))
        })

        it("should increment the deposits array", async () => {
          expect(await mezoAllocator.deposits(1)).to.equal(2)
        })

        it("should populate deposits mapping", async () => {
          const deposit = await mezoAllocator.depositsById(2)
          expect(deposit.balance).to.equal(to1e18(5))
        })
      })
    })
  })

  describe("updateTbtcStorage", () => {
    context("when the caller is not an owner", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator
            .connect(thirdParty)
            .updateTbtcStorage(thirdParty.address),
        ).to.be.revertedWithCustomError(
          mezoAllocator,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when the caller is an owner", () => {
      it("should not revert", async () => {
        await mezoAllocator
          .connect(governance)
          .updateTbtcStorage(thirdParty.address)
        const tbtcStorageAddress = await mezoAllocator.tbtcStorage()
        expect(tbtcStorageAddress).to.equal(thirdParty.address)
      })
    })
  })

  describe("updateMaintainer", () => {
    context("when the caller is not an owner", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator
            .connect(thirdParty)
            .updateMaintainer(thirdParty.address),
        ).to.be.revertedWithCustomError(
          mezoAllocator,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when the caller is an owner", () => {
      it("should not revert", async () => {
        await mezoAllocator
          .connect(governance)
          .updateMaintainer(thirdParty.address)
        const maintainerAddress = await mezoAllocator.maintainer()
        expect(maintainerAddress).to.equal(thirdParty.address)
      })
    })
  })
})
