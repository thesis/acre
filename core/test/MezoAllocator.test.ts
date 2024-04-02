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
  const [depositor, depositor2, thirdParty] = await getUnnamedSigners()

  return {
    dispatcher,
    governance,
    depositor,
    depositor2,
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
  let depositor: HardhatEthersSigner
  let depositor2: HardhatEthersSigner
  let maintainer: HardhatEthersSigner

  before(async () => {
    ;({
      governance,
      depositor,
      depositor2,
      thirdParty,
      maintainer,
      tbtc,
      stbtc,
      mezoAllocator,
      mezoPortal,
    } = await loadFixture(fixture))
  })

  describe("deposit", () => {
    beforeAfterSnapshotWrapper()

    context("when the caller is not an owner", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).deposit(to1e18(1)),
        ).to.be.revertedWithCustomError(mezoAllocator, "NotAuthorized")
      })
    })

    context("when the caller is an owner", () => {
      it("should not revert", async () => {
        await expect(
          mezoAllocator.connect(governance).deposit(to1e18(1)),
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

          tx = await mezoAllocator.connect(maintainer).deposit(to1e18(1))
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

          await mezoAllocator.connect(maintainer).deposit(to1e18(5))
        })

        it("should create two deposits", async () => {
          const depositsArrayLen = await mezoAllocator.getDeposits()
          expect(depositsArrayLen.length).to.equal(2)
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

  describe("withdraw", () => {
    beforeAfterSnapshotWrapper()

    context("when the caller is not a withdrawer", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).withdraw(1),
        ).to.be.revertedWithCustomError(mezoAllocator, "NotAuthorized")
      })
    })

    context("when the caller is a withdrawer", () => {
      context("when there are no deposits", () => {
        it("should revert", async () => {
          await expect(
            stbtc.withdraw(1, thirdParty, thirdParty),
          ).to.be.revertedWithCustomError(mezoAllocator, "NoDeposits")
        })
      })

      context(
        "when there are no assets in stBTC available for withdrawal",
        () => {
          context("when there was a single deposit made to Mezo", () => {
            beforeAfterSnapshotWrapper()

            before(async () => {
              await tbtc.mint(depositor, to1e18(2))
              await tbtc.approve(await stbtc.getAddress(), to1e18(2))
              await stbtc
                .connect(depositor)
                .deposit(to1e18(1), depositor.address)
              await mezoAllocator
                .connect(governance)
                .updateMaintainer(maintainer.address)
              await mezoAllocator.connect(maintainer).deposit(to1e18(1))

              await stbtc
                .connect(depositor)
                .withdraw(to1e18(1), depositor, depositor)
            })

            it("should withdraw from MezoAllocator", async () => {
              expect(
                await tbtc.balanceOf(await mezoAllocator.getAddress()),
              ).to.equal(0)
            })

            it("should withdraw from Mezo Portal", async () => {
              // await stbtc.connect(depositor).withdraw(to1e18(1), depositor, depositor)
              expect(await tbtc.balanceOf(await mezoPortal.getAddress()))
                .to.equal(0)
                .to.equal(0)
            })

            it("should withdraw and transfer tBTC back to a depositor", async () => {
              expect(await tbtc.balanceOf(depositor)).to.equal(to1e18(2))
            })

            it("should decrement the deposits array", async () => {
              const depositsArrayLen = await mezoAllocator.getDeposits()
              expect(depositsArrayLen.length).to.equal(0)
            })

            it("should reset the deposits mapping", async () => {
              const deposit = await mezoAllocator.depositsById(1)
              expect(deposit.balance).to.equal(0n)
              expect(deposit.createdAt).to.equal(0n)
              expect(deposit.unlockAt).to.equal(0n)
            })
          })

          context("when there were multiple deposits made to Mezo", () => {
            beforeAfterSnapshotWrapper()
            let tx: ContractTransactionResponse

            before(async () => {
              await tbtc.mint(depositor, to1e18(2))
              await tbtc.mint(depositor2, to1e18(5))
              await tbtc
                .connect(depositor)
                .approve(await stbtc.getAddress(), to1e18(2))
              await tbtc
                .connect(depositor2)
                .approve(await stbtc.getAddress(), to1e18(5))
              await mezoAllocator
                .connect(governance)
                .updateMaintainer(maintainer.address)

              await stbtc
                .connect(depositor)
                .deposit(to1e18(2), depositor.address)
              await stbtc
                .connect(depositor2)
                .deposit(to1e18(5), depositor2.address)
              await mezoAllocator.connect(maintainer).deposit(to1e18(2))
              await mezoAllocator.connect(maintainer).deposit(to1e18(3))
              await mezoAllocator.connect(maintainer).deposit(to1e18(2))

              // Simulating obtaining stBTC not through Acre direct deposit
              await stbtc.connect(depositor2).transfer(depositor, to1e18(5))

              tx = await stbtc
                .connect(depositor)
                .withdraw(to1e18(6), depositor, depositor)
            })

            it("should withdraw six tBTC from MezoPortal", async () => {
              const tbtcInMezoPortal = await tbtc.balanceOf(
                await mezoPortal.getAddress(),
              )
              expect(tbtcInMezoPortal).to.equal(to1e18(1))
            })

            it("should transfer six tBTC back to the depositor", async () => {
              expect(await tbtc.balanceOf(depositor)).to.equal(to1e18(6))
            })

            it("should decrement the deposits array", async () => {
              const depositsArrayLen = await mezoAllocator.getDeposits()
              expect(depositsArrayLen.length).to.equal(1)
            })

            it("should leave 1 tBTC in deposits mapping", async () => {
              const remainingDeposit = await mezoAllocator.depositsById(1)
              expect(remainingDeposit.balance).to.equal(to1e18(1))
            })

            it("should leave 1 tBTC in mezo portal", async () => {
              const mezoPortalBalance = await tbtc.balanceOf(
                await mezoPortal.getAddress(),
              )
              expect(mezoPortalBalance).to.equal(to1e18(1))
            })

            it("should zero all other deposits", async () => {
              const deposit2 = await mezoAllocator.depositsById(2)
              const deposit3 = await mezoAllocator.depositsById(3)
              expect(deposit2.balance).to.equal(0n)
              expect(deposit3.balance).to.equal(0n)
            })

            it("should emit DepositWithdrawn event with a second deposit", async () => {
              await expect(tx)
                .to.emit(mezoAllocator, "DepositWithdrawn")
                .withArgs(2, to1e18(3))
            })

            it("should emit DepositWithdrawn event with a third deposit", async () => {
              await expect(tx)
                .to.emit(mezoAllocator, "DepositWithdrawn")
                .withArgs(3, to1e18(2))
            })
          })
        },
      )

      context("when there are assets in stBTC available for withdrawal", () => {
        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtc.mint(depositor, to1e18(3))
          await tbtc.approve(await stbtc.getAddress(), to1e18(3))
          await stbtc.connect(depositor).deposit(to1e18(3), depositor.address)
          await mezoAllocator
            .connect(governance)
            .updateMaintainer(maintainer.address)
          await mezoAllocator.connect(maintainer).deposit(to1e18(2))

          await stbtc
            .connect(depositor)
            .withdraw(to1e18(2), depositor, depositor)
        })

        it("should withdraw 1 tBTC from stBTC", async () => {
          expect(await tbtc.balanceOf(await stbtc.getAddress())).to.equal(
            to1e18(0),
          )
        })

        it("should withdraw 1 tBTC from Mezo Portal", async () => {
          expect(await tbtc.balanceOf(await mezoPortal.getAddress())).to.equal(
            to1e18(1),
          )
        })

        it("should update the deposit balance", async () => {
          const deposit = await mezoAllocator.depositsById(1)
          expect(deposit.balance).to.equal(to1e18(1))
        })

        it("should remain the deposits array length", async () => {
          const depositsArrayLen = await mezoAllocator.getDeposits()
          expect(depositsArrayLen.length).to.equal(1)
        })

        it("should transfer 2 tBTC back to the depositor", async () => {
          expect(await tbtc.balanceOf(depositor)).to.equal(to1e18(2))
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
