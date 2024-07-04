import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper } from "../helpers"

import {
  StBTC as stBTC,
  TestERC20,
  MezoAllocator,
  IMezoPortal,
} from "../../typechain"

import { to1e18 } from "../utils"
import { integrationTestFixture } from "./helpers"

const { getUnnamedSigners } = helpers.signers
const { impersonateAccount } = helpers.account

describe("MezoAllocator", () => {
  // This is a random mainnet address of the whale account that holds 100 tBTC
  // tokens that can be used for testing purposes after impersonation.
  const whaleAddress = "0x84eA3907b9206427F45c7b2614925a2B86D12611"

  // As of a forked block 19813880, the deposit id was 4999 before the new
  // allocation. The deposit id should be incremented by 1.
  const expectedDepositId = 5000n

  let tbtc: TestERC20
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let mezoPortal: IMezoPortal

  let thirdParty: HardhatEthersSigner
  let depositor: HardhatEthersSigner
  let maintainer: HardhatEthersSigner
  let governance: HardhatEthersSigner
  let tbtcHolder: HardhatEthersSigner

  before(async () => {
    ;({ maintainer, governance, tbtc, stbtc, mezoAllocator, mezoPortal } =
      await loadFixture(integrationTestFixture))
    ;[depositor, thirdParty] = await getUnnamedSigners()

    await impersonateAccount(whaleAddress)
    tbtcHolder = await ethers.getSigner(whaleAddress)

    await stbtc.connect(governance).updateEntryFeeBasisPoints(0)
    await stbtc.connect(governance).updateExitFeeBasisPoints(0)
  })

  describe("allocate", () => {
    beforeAfterSnapshotWrapper()

    context("when a caller is not a maintainer", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).allocate(),
        ).to.be.revertedWithCustomError(mezoAllocator, "CallerNotMaintainer")
      })
    })

    context("when the caller is maintainer", () => {
      context("when a first deposit is made", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc
            .connect(tbtcHolder)
            .transfer(await stbtc.getAddress(), to1e18(6))
          tx = await mezoAllocator.connect(maintainer).allocate()
        })

        it("should deposit and transfer tBTC to Mezo Portal", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [await mezoPortal.getAddress()],
            [to1e18(6)],
          )
        })

        it("should not store any tBTC in Mezo Allocator", async () => {
          expect(
            await tbtc.balanceOf(await mezoAllocator.getAddress()),
          ).to.equal(0)
        })

        it("should increment the deposit id", async () => {
          const actualDepositId = await mezoAllocator.depositId()

          expect(actualDepositId).to.equal(expectedDepositId)
        })

        it("should increase tracked deposit balance amount", async () => {
          const depositBalance = await mezoAllocator.depositBalance()
          expect(depositBalance).to.equal(to1e18(6))
        })

        it("should emit DepositAllocated event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(0, expectedDepositId, to1e18(6), to1e18(6))
        })
      })

      context("when a second deposit is made", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc
            .connect(tbtcHolder)
            .transfer(await stbtc.getAddress(), to1e18(5))

          tx = await mezoAllocator.connect(maintainer).allocate()
        })

        it("should increment the deposit id", async () => {
          const actualDepositId = await mezoAllocator.depositId()
          expect(actualDepositId).to.equal(expectedDepositId + 1n)
        })

        it("should emit DepositAllocated event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(
              expectedDepositId,
              expectedDepositId + 1n,
              to1e18(5),
              to1e18(11),
            )
        })

        it("should deposit and transfer tBTC to Mezo Portal", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [await mezoPortal.getAddress()],
            [to1e18(5)],
          )
        })

        it("should increase tracked deposit balance amount", async () => {
          const depositBalance = await mezoAllocator.depositBalance()
          expect(depositBalance).to.equal(to1e18(11))
        })

        it("should not store any tBTC in Mezo Allocator", async () => {
          expect(
            await tbtc.balanceOf(await mezoAllocator.getAddress()),
          ).to.equal(0)
        })

        it("should not store any tBTC in stBTC", async () => {
          expect(await tbtc.balanceOf(await stbtc.getAddress())).to.equal(0)
        })
      })
    })
  })

  describe("withdraw", () => {
    beforeAfterSnapshotWrapper()

    context("when a caller is not stBTC", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).withdraw(1n),
        ).to.be.revertedWithCustomError(mezoAllocator, "CallerNotStbtc")
      })
    })

    context("when the caller is stBTC contract", () => {
      context("when there is no deposit", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          // It is reverted because deposit id is 0 and there is no deposit
          // with id 0 in Mezo Portal for Acre.
          await expect(
            stbtc.withdraw(1n, depositor, depositor),
          ).to.be.revertedWithCustomError(mezoPortal, "DepositNotFound")
        })
      })

      context("when there is a deposit", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.connect(tbtcHolder).transfer(depositor.address, to1e18(11))
          await tbtc.approve(await stbtc.getAddress(), to1e18(5))
          await stbtc.connect(depositor).deposit(to1e18(5), depositor)
          await mezoAllocator.connect(maintainer).allocate()
        })

        context("when the deposit is not fully withdrawn", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            tx = await stbtc.withdraw(to1e18(2), depositor, depositor)
          })

          it("should transfer 2 tBTC back to a depositor", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [depositor.address],
              [to1e18(2)],
            )
          })

          it("should emit DepositWithdrawn event", async () => {
            await expect(tx)
              .to.emit(mezoAllocator, "DepositWithdrawn")
              .withArgs(expectedDepositId, to1e18(2))
          })

          it("should decrease tracked deposit balance amount", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(to1e18(3))
          })

          it("should decrease Mezo Portal balance", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [await mezoPortal.getAddress()],
              [-to1e18(2)],
            )
          })
        })

        context("when the deposit is fully withdrawn", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            tx = await stbtc.withdraw(to1e18(5), depositor, depositor)
          })

          it("should transfer 5 tBTC back to a depositor", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [depositor.address],
              [to1e18(5)],
            )
          })

          it("should emit DepositWithdrawn event", async () => {
            await expect(tx)
              .to.emit(mezoAllocator, "DepositWithdrawn")
              .withArgs(expectedDepositId, to1e18(5))
          })

          it("should decrease tracked deposit balance amount to zero", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(0)
          })

          it("should decrease Mezo Portal balance", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [await mezoPortal.getAddress()],
              [-to1e18(5)],
            )
          })
        })

        context("when withdrawing more than was deposited", () => {
          beforeAfterSnapshotWrapper()

          it("should revert", async () => {
            await expect(stbtc.withdraw(to1e18(6), depositor, depositor))
              .to.be.revertedWithCustomError(
                mezoPortal,
                "InsufficientDepositAmount",
              )
              .withArgs(to1e18(6), to1e18(5))
          })
        })
      })
    })
  })

  describe("totalAssets", () => {
    beforeAfterSnapshotWrapper()

    context("when there is no deposit", () => {
      it("should return 0", async () => {
        const totalAssets = await mezoAllocator.totalAssets()
        expect(totalAssets).to.equal(0)
      })
    })

    context("when there is a deposit", () => {
      before(async () => {
        await tbtc
          .connect(tbtcHolder)
          .transfer(await stbtc.getAddress(), to1e18(5))
        await mezoAllocator.connect(maintainer).allocate()
      })

      it("should return the total assets value", async () => {
        const totalAssets = await mezoAllocator.totalAssets()
        expect(totalAssets).to.equal(to1e18(5))
      })
    })
  })

  describe("releaseDeposit", () => {
    beforeAfterSnapshotWrapper()

    context("when a caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).releaseDeposit(),
        ).to.be.revertedWithCustomError(
          mezoAllocator,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when the caller is governance", () => {
      context("when there is a deposit", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc
            .connect(tbtcHolder)
            .transfer(await stbtc.getAddress(), to1e18(5))
          await mezoAllocator.connect(maintainer).allocate()
          tx = await mezoAllocator.connect(governance).releaseDeposit()
        })

        it("should emit DepositReleased event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositReleased")
            .withArgs(expectedDepositId, to1e18(5))
        })

        it("should decrease tracked deposit balance amount to zero", async () => {
          const depositBalance = await mezoAllocator.depositBalance()
          expect(depositBalance).to.equal(0)
        })

        it("should decrease Mezo Portal balance", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [mezoPortal, stbtc],
            [-to1e18(5), to1e18(5)],
          )
        })
      })
    })
  })
})
