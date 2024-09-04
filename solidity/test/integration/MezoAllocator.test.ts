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

  // As of a forked block, the deposit id was 17469 before the new allocation.
  // The deposit id should be incremented by 1.
  const expectedDepositId = 17470n

  let tbtc: TestERC20
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let mezoPortal: IMezoPortal

  let thirdParty: HardhatEthersSigner
  let depositor: HardhatEthersSigner
  let maintainer: HardhatEthersSigner
  let governance: HardhatEthersSigner
  let tbtcHolder: HardhatEthersSigner

  // Existing Mezo Portal deposit ID.
  let existingDepositId: bigint
  // Existing Mezo Portal deposit amount.
  let existingDepositAmount: bigint
  // Unallocated funds in stBTC contract.
  let existingUnallocatedFunds: bigint

  before(async () => {
    ;({ maintainer, governance, tbtc, stbtc, mezoAllocator, mezoPortal } =
      await loadFixture(integrationTestFixture))
    ;[depositor, thirdParty] = await getUnnamedSigners()

    await impersonateAccount(whaleAddress)
    tbtcHolder = await ethers.getSigner(whaleAddress)

    existingDepositId = await mezoAllocator.depositId()

    existingDepositAmount = await mezoAllocator.depositBalance()
    existingUnallocatedFunds = await tbtc.balanceOf(await stbtc.getAddress())
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
      beforeAfterSnapshotWrapper()

      const newFunds = to1e18(6)
      let expectedNewDepositAmount: bigint
      let expectedTotalDepositAmount: bigint

      let tx: ContractTransactionResponse

      before(async () => {
        expectedNewDepositAmount = existingUnallocatedFunds + newFunds
        expectedTotalDepositAmount =
          existingDepositAmount + expectedNewDepositAmount

        await tbtc
          .connect(tbtcHolder)
          .transfer(await stbtc.getAddress(), newFunds)
        tx = await mezoAllocator.connect(maintainer).allocate()
      })

      it("should increment the deposit id", async () => {
        const actualDepositId = await mezoAllocator.depositId()
        expect(actualDepositId).to.equal(expectedDepositId)
      })

      it("should emit DepositAllocated event", async () => {
        await expect(tx)
          .to.emit(mezoAllocator, "DepositAllocated")
          .withArgs(
            existingDepositId,
            expectedDepositId,
            expectedNewDepositAmount,
            expectedTotalDepositAmount,
          )
      })

      it("should deposit and transfer tBTC to Mezo Portal", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [await mezoPortal.getAddress()],
          [expectedNewDepositAmount],
        )
      })

      it("should increase tracked deposit balance amount", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        expect(depositBalance).to.equal(expectedTotalDepositAmount)
      })

      it("should not store any tBTC in Mezo Allocator", async () => {
        expect(await tbtc.balanceOf(await mezoAllocator.getAddress())).to.equal(
          0,
        )
      })

      it("should not store any tBTC in stBTC", async () => {
        expect(await tbtc.balanceOf(await stbtc.getAddress())).to.equal(0)
      })
    })
  })

  describe("withdraw", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await stbtc.connect(governance).updateExitFeeBasisPoints(0)
    })

    context("when a caller is not stBTC", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).withdraw(1n),
        ).to.be.revertedWithCustomError(mezoAllocator, "CallerNotStbtc")
      })
    })

    context("when the caller is stBTC contract", () => {
      context("when there is a deposit", () => {
        beforeAfterSnapshotWrapper()

        const depositAmount = to1e18(6)
        const donationAmount = to1e18(2)

        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.connect(tbtcHolder).transfer(depositor.address, to1e18(11))
          await tbtc.approve(await stbtc.getAddress(), depositAmount)
          await stbtc.connect(depositor).deposit(depositAmount, depositor)
          await mezoAllocator.connect(maintainer).allocate()

          // Donate 1 tBTC to the MezoAllocator.
          await tbtc
            .connect(tbtcHolder)
            .transfer(await mezoAllocator.getAddress(), donationAmount)
        })

        context("when withdrawing less than was deposited", () => {
          beforeAfterSnapshotWrapper()

          const withdrawAmount = to1e18(3)

          before(async () => {
            tx = await stbtc
              .connect(depositor)
              .withdraw(withdrawAmount, depositor, depositor)
          })

          it("should transfer tBTC back to a depositor", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [depositor.address],
              [withdrawAmount],
            )
          })

          it("should emit DepositWithdrawn event", async () => {
            await expect(tx)
              .to.emit(mezoAllocator, "WithdrawFromMezoPortal")
              .withArgs(expectedDepositId, withdrawAmount, to1e18(1))
          })

          it("should decrease tracked deposit balance amount", async () => {
            expect(await mezoAllocator.depositBalance()).to.equal(
              existingDepositAmount + existingUnallocatedFunds + to1e18(5),
            )
          })

          it("should decrease MezoAllocator balance", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [await mezoAllocator.getAddress()],
              [-donationAmount],
            )
          })

          it("should decrease Mezo Portal balance", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [await mezoPortal.getAddress()],
              [-to1e18(1)],
            )
          })
        })

        context("when withdrawing more than was deposited", () => {
          beforeAfterSnapshotWrapper()

          it("should revert", async () => {
            const mezoDepositAmount =
              existingDepositAmount + existingUnallocatedFunds + depositAmount

            const withdrawAmount = mezoDepositAmount + donationAmount + 1n

            await expect(stbtc.withdraw(withdrawAmount, depositor, depositor))
              .to.be.revertedWithCustomError(
                mezoAllocator,
                "WithdrawalAmountExceedsDepositBalance",
              )
              .withArgs(withdrawAmount - donationAmount, mezoDepositAmount)
          })
        })
      })
    })
  })

  describe("totalAssets", () => {
    beforeAfterSnapshotWrapper()

    context("when there is a deposit and unallocated funds", () => {
      beforeAfterSnapshotWrapper()

      context("before allocation", () => {
        it("should return existing deposit", async () => {
          const totalAssets = await mezoAllocator.totalAssets()
          expect(totalAssets).to.equal(existingDepositAmount)
        })
      })

      context("after allocation", () => {
        before(async () => {
          await mezoAllocator.connect(maintainer).allocate()
        })

        it("should return existing deposit", async () => {
          const totalAssets = await mezoAllocator.totalAssets()
          expect(totalAssets).to.equal(
            existingDepositAmount + existingUnallocatedFunds,
          )
        })
      })

      context("after a new deposit", () => {
        before(async () => {
          await tbtc
            .connect(tbtcHolder)
            .transfer(await stbtc.getAddress(), to1e18(5))
          await mezoAllocator.connect(maintainer).allocate()
        })

        it("should return the total assets value", async () => {
          const totalAssets = await mezoAllocator.totalAssets()
          expect(totalAssets).to.equal(
            existingDepositAmount + existingUnallocatedFunds + to1e18(5),
          )
        })
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
      let tx: ContractTransactionResponse

      before(async () => {
        tx = await mezoAllocator.connect(governance).releaseDeposit()
      })

      it("should emit DepositReleased event", async () => {
        await expect(tx)
          .to.emit(mezoAllocator, "DepositReleased")
          .withArgs(existingDepositId, existingDepositAmount)
      })

      it("should decrease tracked deposit balance amount to zero", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        expect(depositBalance).to.equal(0)
      })

      it("should decrease Mezo Portal balance", async () => {
        await expect(tx).to.changeTokenBalances(
          tbtc,
          [mezoPortal, stbtc],
          [-existingDepositAmount, existingDepositAmount],
        )
      })
    })
  })
})
