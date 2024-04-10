import { helpers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse, ZeroAddress } from "ethers"
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
  let tbtc: TestERC20
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let mezoPortal: IMezoPortal

  let thirdParty: HardhatEthersSigner
  let depositor: HardhatEthersSigner
  let maintainer: HardhatEthersSigner
  let governance: HardhatEthersSigner

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
          await expect(stbtc.withdraw(1n, depositor, depositor))
            .to.be.revertedWithCustomError(tbtc, "ERC20InsufficientBalance")
            .withArgs(await mezoPortal.getAddress(), 0, 1n)
        })
      })

      context("when there is a deposit", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.mint(depositor, to1e18(5))
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
              .withArgs(1, to1e18(2))
          })

          it("should decrease tracked deposit balance amount", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(to1e18(3))
          })

          it("should decrease Mezo Portal balance", async () => {
            expect(
              await tbtc.balanceOf(await mezoPortal.getAddress()),
            ).to.equal(to1e18(3))
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
              .withArgs(1, to1e18(3))
          })

          it("should decrease tracked deposit balance amount to zero", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(0)
          })

          it("should decrease Mezo Portal balance", async () => {
            expect(
              await tbtc.balanceOf(await mezoPortal.getAddress()),
            ).to.equal(0)
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
        await tbtc.mint(await stbtc.getAddress(), to1e18(5))
        await mezoAllocator.connect(maintainer).allocate()
      })

      it("should return the total assets value", async () => {
        const totalAssets = await mezoAllocator.totalAssets()
        expect(totalAssets).to.equal(to1e18(5))
      })
    })
  })

  describe("addMaintainer", () => {
    beforeAfterSnapshotWrapper()

    context("when a caller is not a governance", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).addMaintainer(depositor.address),
        ).to.be.revertedWithCustomError(
          mezoAllocator,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when a caller is governance", () => {
      context("when a maintainer is added", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          tx = await mezoAllocator
            .connect(governance)
            .addMaintainer(thirdParty.address)
        })

        it("should add a maintainer", async () => {
          expect(await mezoAllocator.isMaintainer(thirdParty.address)).to.equal(
            true,
          )
        })

        it("should emit MaintainerAdded event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "MaintainerAdded")
            .withArgs(thirdParty.address)
        })

        it("should add a new maintainer to the list", async () => {
          const maintainers = await mezoAllocator.getMaintainers()
          expect(maintainers).to.deep.equal([
            maintainer.address,
            thirdParty.address,
          ])
        })

        it("should not allow to add the same maintainer twice", async () => {
          await expect(
            mezoAllocator.connect(governance).addMaintainer(thirdParty.address),
          ).to.be.revertedWithCustomError(
            mezoAllocator,
            "MaintainerAlreadyRegistered",
          )
        })

        it("should not allow to add a zero address as a maintainer", async () => {
          await expect(
            mezoAllocator.connect(governance).addMaintainer(ZeroAddress),
          ).to.be.revertedWithCustomError(mezoAllocator, "ZeroAddress")
        })
      })
    })
  })

  describe("removeMaintainer", () => {
    beforeAfterSnapshotWrapper()

    context("when a caller is not a governance", () => {
      it("should revert", async () => {
        await expect(
          mezoAllocator.connect(thirdParty).removeMaintainer(depositor.address),
        ).to.be.revertedWithCustomError(
          mezoAllocator,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when a caller is governance", () => {
      context("when a maintainer is removed", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await mezoAllocator
            .connect(governance)
            .addMaintainer(thirdParty.address)
          tx = await mezoAllocator
            .connect(governance)
            .removeMaintainer(thirdParty.address)
        })

        it("should remove a maintainer", async () => {
          expect(await mezoAllocator.isMaintainer(thirdParty.address)).to.equal(
            false,
          )
        })

        it("should emit MaintainerRemoved event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "MaintainerRemoved")
            .withArgs(thirdParty.address)
        })

        it("should remove a maintainer from the list", async () => {
          const maintainers = await mezoAllocator.getMaintainers()
          expect(maintainers).to.deep.equal([maintainer.address])
        })

        it("should not allow to remove a maintainer twice", async () => {
          await expect(
            mezoAllocator
              .connect(governance)
              .removeMaintainer(thirdParty.address),
          ).to.be.revertedWithCustomError(
            mezoAllocator,
            "MaintainerNotRegistered",
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
      context("when there is a deposit", () => {
        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), to1e18(5))
          await mezoAllocator.connect(maintainer).allocate()
          tx = await mezoAllocator.connect(governance).releaseDeposit()
        })

        it("should emit DepositReleased event", async () => {
          await expect(tx)
            .to.emit(mezoAllocator, "DepositReleased")
            .withArgs(1, to1e18(5))
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
