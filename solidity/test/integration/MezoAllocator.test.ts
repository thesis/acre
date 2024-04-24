import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "../helpers"

import {
  StBTC as stBTC,
  TestERC20,
  MezoAllocator,
  IMezoPortal,
} from "../../typechain"

import { to1e18 } from "../utils"

const { getNamedSigners, getUnnamedSigners } = helpers.signers
const { impersonateAccount } = helpers.account

async function fixture() {
  const { tbtc, stbtc, mezoAllocator, mezoPortal } = await deployment()
  const { governance, maintainer } = await getNamedSigners()
  const [depositor, thirdParty] = await getUnnamedSigners()

  return {
    governance,
    thirdParty,
    depositor,
    maintainer,
    tbtc,
    stbtc,
    mezoAllocator,
    mezoPortal,
  }
}

describe("MezoAllocator", () => {
  // This is a random mainnet address of the whale account that holds 100 tBTC
  // tokens that can be used for testing purposes after impersonation.
  const whaleAddress = "0x84eA3907b9206427F45c7b2614925a2B86D12611"
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
    ;({
      thirdParty,
      depositor,
      maintainer,
      governance,
      tbtc,
      stbtc,
      mezoAllocator,
      mezoPortal,
    } = await loadFixture(fixture))

    await impersonateAccount(whaleAddress)
    tbtcHolder = await ethers.getSigner(whaleAddress)
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
          // As of writing this test, the deposit id was 2272 before the new
          // allocation. The deposit id should be incremented by 1.
          expect(actualDepositId).to.equal(2273)
        })

        it("should increase tracked deposit balance amount", async () => {
          const depositBalance = await mezoAllocator.depositBalance()
          expect(depositBalance).to.equal(to1e18(6))
        })

        it("should emit DepositAllocated event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(0, 2273, to1e18(6), to1e18(6))
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
          expect(actualDepositId).to.equal(2274)
        })

        it("should emit DepositAllocated event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositAllocated")
            .withArgs(2273, 2274, to1e18(5), to1e18(11))
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
        it("should revert", async () => {
          // It is reverted because deposit Id is 0 and there is no deposit
          // with id 0 in Mezo Portal for Acre. Mezo Portal reverts with the
          // "unrecognized custom error" that is why we verify only against
          // a generic revert.
          await expect(stbtc.withdraw(1n, depositor, depositor)).to.be.reverted
        })
      })

      context("when there is a deposit", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.connect(tbtcHolder).transfer(depositor.address, to1e18(11))
          await tbtc.approve(await stbtc.getAddress(), to1e18(5))
          await stbtc.connect(depositor).deposit(to1e18(5), depositor)
          await mezoAllocator.connect(maintainer).allocate()
        })

        context("when the deposit is not fully withdrawn", () => {
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
              .withArgs(2273, to1e18(2))
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
          before(async () => {
            tx = await stbtc.withdraw(to1e18(3), depositor, depositor)
          })

          it("should transfer 3 tBTC back to a depositor", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [depositor.address],
              [to1e18(3)],
            )
          })

          it("should emit DepositWithdrawn event", async () => {
            await expect(tx)
              .to.emit(mezoAllocator, "DepositWithdrawn")
              .withArgs(2273, to1e18(3))
          })

          it("should decrease tracked deposit balance amount to zero", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(0)
          })

          it("should decrease Mezo Portal balance", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [await mezoPortal.getAddress()],
              [-to1e18(3)],
            )
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
            .withArgs(2273, to1e18(5))
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
