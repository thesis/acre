import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import {
  impersonateAccount,
  loadFixture,
  setBalance,
  stopImpersonatingAccount,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"

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
  const [depositor, depositor2, thirdParty] = await getUnnamedSigners()

  return {
    governance,
    thirdParty,
    depositor,
    depositor2,
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
  let depositor2: HardhatEthersSigner
  let maintainer: HardhatEthersSigner
  let governance: HardhatEthersSigner
  let stbtcFakeSigner: HardhatEthersSigner

  before(async () => {
    ;({
      thirdParty,
      depositor,
      depositor2,
      maintainer,
      governance,
      tbtc,
      stbtc,
      mezoAllocator,
      mezoPortal,
    } = await loadFixture(fixture))

    await stbtc.connect(governance).updateEntryFeeBasisPoints(0)
    await stbtc.connect(governance).updateExitFeeBasisPoints(0)

    // Impersonate stBTC contract to be able to fake msg.sender.
    await impersonateAccount(await stbtc.getAddress())
    stbtcFakeSigner = await ethers.getSigner(await stbtc.getAddress())
    await setBalance(stbtcFakeSigner.address, to1e18(1))
  })

  after(async () => {
    await stopImpersonatingAccount(await stbtc.getAddress())
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
      context("when two consecutive deposits are made", () => {
        beforeAfterSnapshotWrapper()

        context("when a first deposit is made", () => {
          let tx: ContractTransactionResponse

          before(async () => {
            await tbtc.mint(await stbtc.getAddress(), to1e18(6))
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
            expect(actualDepositId).to.equal(1)
          })

          it("should increase tracked deposit balance amount", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(to1e18(6))
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
            expect(
              await tbtc.balanceOf(await mezoPortal.getAddress()),
            ).to.equal(to1e18(11))
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

      context("when accounting for tBTC 'donation' to Mezo Allocator", () => {
        let depositorDepositTx: ContractTransactionResponse
        let depositorRedeemTx: ContractTransactionResponse
        let depositor2DepositTx: ContractTransactionResponse
        let depositor2RedeemTx: ContractTransactionResponse

        beforeAfterSnapshotWrapper()

        before(async () => {
          await tbtc.mint(depositor, to1e18(1))
          await tbtc
            .connect(depositor)
            .approve(await stbtc.getAddress(), to1e18(1))
          // Deposit by the first depositor
          depositorDepositTx = await stbtc
            .connect(depositor)
            .deposit(to1e18(1), depositor)

          // Mezo Portal first allocation
          await mezoAllocator.connect(maintainer).allocate()

          // Donation / rewards
          await tbtc.mint(await mezoAllocator.getAddress(), to1e18(1))

          await tbtc.mint(depositor2, to1e18(1))
          await tbtc
            .connect(depositor2)
            .approve(await stbtc.getAddress(), to1e18(1))
          // Deposit by the second depositor
          depositor2DepositTx = await stbtc
            .connect(depositor2)
            .deposit(to1e18(1), depositor2)
          // Mezo Portal second allocation
          await mezoAllocator.connect(maintainer).allocate()

          // Redeeming shares by the first depositor
          const stBTCdepositorBalance = await stbtc.balanceOf(depositor)
          depositorRedeemTx = await stbtc
            .connect(depositor)
            .redeem(stBTCdepositorBalance, depositor, depositor)

          // Redeeming shares by the second depositor
          const stBTCdepositor2Balance = await stbtc.balanceOf(depositor2)
          depositor2RedeemTx = await stbtc
            .connect(depositor2)
            .redeem(stBTCdepositor2Balance, depositor2, depositor2)
        })

        it("should mint correct amount of shares for the first depositor", async () => {
          await expect(depositorDepositTx).to.changeTokenBalances(
            stbtc,
            [depositor.address],
            [to1e18(1)],
          )
        })

        it("should mint correct amount of shares for the second depositor", async () => {
          // expected shares = (assets * total supply of shares) / total assets
          // expected shares = (1 * 1 stBTC) / 2 tBTC = 0.5
          await expect(depositor2DepositTx).to.changeTokenBalances(
            stbtc,
            [depositor2.address],
            [500000000000000000n], // 0.5 stBTC
          )
        })

        it("should redeem shares with accounting for 'donation' for the first depositor", async () => {
          // expected tBTC = shares * total assets / total supply of shares
          // expected tBTC = (1 * 3) / 1.5 = 2
          await expect(depositorRedeemTx).to.changeTokenBalances(
            tbtc,
            [depositor.address],
            [to1e18(2) - 1n], // adjusted for rounding
          )
        })

        it("should redeem shares without accounting for 'donation' for the second depositor", async () => {
          // expected tBTC = shares * total assets / total supply of shares
          // expected tBTC = (0.5 * 3) / 1.5 = 2
          await expect(depositor2RedeemTx).to.changeTokenBalances(
            tbtc,
            [depositor2.address],
            [to1e18(1)],
          )
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
          await expect(mezoAllocator.connect(stbtcFakeSigner).withdraw(1n))
            .to.be.revertedWithCustomError(
              mezoAllocator,
              "WithdrawalAmountExceedsDepositBalance",
            )
            .withArgs(1n, 0n)
        })
      })

      context("when there is a deposit", () => {
        const testWithdrawalFromMezoPortal = ({
          initialDepositBalance,
          partialWithdrawal,
          fullWithdrawal,
        }: {
          initialDepositBalance: bigint
          partialWithdrawal: {
            requestedAmount: bigint
            expectedWithdrawnAmount: bigint
          }
          fullWithdrawal: {
            requestedAmount: bigint
            expectedWithdrawnAmount: bigint
            expectMaxWithdrawalExceeded?: boolean
          }
        }) =>
          // eslint-disable-next-line func-names
          function () {
            beforeAfterSnapshotWrapper()

            context("when the deposit is partially withdrawn", () => {
              beforeAfterSnapshotWrapper()

              before(async () => {
                tx = await mezoAllocator
                  .connect(stbtcFakeSigner)
                  .withdraw(partialWithdrawal.requestedAmount)
              })

              it("should transfer tBTC to stBTC contract", async () => {
                await expect(tx).to.changeTokenBalances(
                  tbtc,
                  [await stbtc.getAddress()],
                  [partialWithdrawal.requestedAmount],
                )
              })

              it("should emit DepositWithdrawn event", async () => {
                await expect(tx)
                  .to.emit(mezoAllocator, "DepositWithdrawn")
                  .withArgs(1, partialWithdrawal.expectedWithdrawnAmount)
              })

              it("should decrease tracked deposit balance amount", async () => {
                const depositBalance = await mezoAllocator.depositBalance()
                expect(depositBalance).to.equal(
                  initialDepositBalance -
                    partialWithdrawal.expectedWithdrawnAmount,
                )
              })

              it("should decrease Mezo Portal balance", async () => {
                await expect(tx).to.changeTokenBalances(
                  tbtc,
                  [await mezoPortal.getAddress()],
                  [-partialWithdrawal.expectedWithdrawnAmount],
                )
              })

              it("should call MezoPortal.withdrawPartially function", async () => {
                await expect(tx)
                  .to.emit(mezoPortal, "WithdrawPartially")
                  .withArgs(
                    await tbtc.getAddress(),
                    1,
                    partialWithdrawal.expectedWithdrawnAmount,
                  )
              })
            })

            context("when the deposit is fully withdrawn", () => {
              beforeAfterSnapshotWrapper()

              before(async () => {
                tx = await mezoAllocator
                  .connect(stbtcFakeSigner)
                  .withdraw(fullWithdrawal.requestedAmount)
              })

              it("should transfer tBTC to stBTC contract", async () => {
                await expect(tx).to.changeTokenBalances(
                  tbtc,
                  [await stbtc.getAddress()],
                  [fullWithdrawal.requestedAmount],
                )
              })

              it("should emit DepositWithdrawn event", async () => {
                await expect(tx)
                  .to.emit(mezoAllocator, "DepositWithdrawn")
                  .withArgs(1, fullWithdrawal.expectedWithdrawnAmount)
              })

              it("should decrease tracked deposit balance amount to zero", async () => {
                const depositBalance = await mezoAllocator.depositBalance()
                expect(depositBalance).to.equal(0)
              })

              it("should decrease Mezo Portal balance", async () => {
                await expect(tx).to.changeTokenBalances(
                  tbtc,
                  [await mezoPortal.getAddress()],
                  [-fullWithdrawal.expectedWithdrawnAmount],
                )
              })

              it("should call MezoPortal.withdraw function", async () => {
                await expect(tx)
                  .to.emit(mezoPortal, "WithdrawFully")
                  .withArgs(await tbtc.getAddress(), 1)
              })
            })

            context("when requested amount exceeds the deposit balance", () => {
              beforeAfterSnapshotWrapper()

              it("should revert", async () => {
                await expect(
                  mezoAllocator
                    .connect(stbtcFakeSigner)
                    .withdraw(fullWithdrawal.requestedAmount + 1n),
                )
                  .to.be.revertedWithCustomError(
                    mezoAllocator,
                    "WithdrawalAmountExceedsDepositBalance",
                  )
                  .withArgs(
                    fullWithdrawal.expectedWithdrawnAmount + 1n,
                    initialDepositBalance,
                  )
              })
            })
          }

        beforeAfterSnapshotWrapper()

        const depositAmount = to1e18(5)

        let tx: ContractTransactionResponse

        before(async () => {
          await tbtc.mint(depositor, depositAmount)
          await tbtc.approve(await stbtc.getAddress(), depositAmount)
          await stbtc.connect(depositor).deposit(depositAmount, depositor)
          await mezoAllocator.connect(maintainer).allocate()
        })

        context(
          "when there is no donation made",
          testWithdrawalFromMezoPortal({
            initialDepositBalance: depositAmount,
            partialWithdrawal: {
              requestedAmount: depositAmount - 1n,
              expectedWithdrawnAmount: depositAmount - 1n,
            },
            fullWithdrawal: {
              requestedAmount: depositAmount,
              expectedWithdrawnAmount: depositAmount,
            },
          }),
        )

        context("when there is a donation made", () => {
          beforeAfterSnapshotWrapper()

          const donationAmount = to1e18(1n)

          before(async () => {
            await tbtc.mint(await mezoAllocator.getAddress(), donationAmount)
          })

          context(
            "when requested amount is lower than unallocated balance",
            () => {
              beforeAfterSnapshotWrapper()

              const withdrawalAmount = donationAmount - 1n

              before(async () => {
                tx = await mezoAllocator
                  .connect(stbtcFakeSigner)
                  .withdraw(withdrawalAmount)
              })

              it("should transfer tBTC to stBTC contract", async () => {
                await expect(tx).to.changeTokenBalances(
                  tbtc,
                  [await stbtc.getAddress()],
                  [withdrawalAmount],
                )
              })

              it("should NOT emit DepositWithdrawn event", async () => {
                await expect(tx).to.not.emit(mezoAllocator, "DepositWithdrawn")
              })

              it("should NOT decrease tracked deposit balance amount", async () => {
                const depositBalance = await mezoAllocator.depositBalance()
                expect(depositBalance).to.equal(depositAmount)
              })

              it("should NOT call MezoPortal.withdrawPartially function", async () => {
                await expect(tx).to.not.emit(mezoPortal, "WithdrawPartially")
              })
            },
          )

          context(
            "when requested amount is equal to unallocated balance",
            () => {
              beforeAfterSnapshotWrapper()

              const withdrawalAmount = donationAmount

              before(async () => {
                tx = await mezoAllocator
                  .connect(stbtcFakeSigner)
                  .withdraw(withdrawalAmount)
              })

              it("should transfer tBTC to stBTC contract", async () => {
                await expect(tx).to.changeTokenBalances(
                  tbtc,
                  [await stbtc.getAddress()],
                  [withdrawalAmount],
                )
              })

              it("should NOT emit DepositWithdrawn event", async () => {
                await expect(tx).to.not.emit(mezoAllocator, "DepositWithdrawn")
              })

              it("should NOT decrease tracked deposit balance amount", async () => {
                const depositBalance = await mezoAllocator.depositBalance()
                expect(depositBalance).to.equal(depositAmount)
              })

              it("should NOT call MezoPortal.withdrawPartially function", async () => {
                await expect(tx).to.not.emit(mezoPortal, "WithdrawPartially")
              })
            },
          )

          context(
            "when requested amount exceeds the unallocated balance",
            testWithdrawalFromMezoPortal({
              initialDepositBalance: depositAmount,
              partialWithdrawal: {
                requestedAmount: donationAmount + 1n,
                expectedWithdrawnAmount: 1n,
              },
              fullWithdrawal: {
                requestedAmount: donationAmount + depositAmount,
                expectedWithdrawnAmount: depositAmount,
                expectMaxWithdrawalExceeded: true,
              },
            }),
          )
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
      beforeAfterSnapshotWrapper()

      before(async () => {
        await tbtc.mint(await stbtc.getAddress(), to1e18(5))
        await mezoAllocator.connect(maintainer).allocate()
      })

      it("should return the total assets value", async () => {
        const totalAssets = await mezoAllocator.totalAssets()
        expect(totalAssets).to.equal(to1e18(5))
      })

      it("should be equal to the deposit balance", async () => {
        const depositBalance = await mezoAllocator.depositBalance()
        expect(await mezoAllocator.totalAssets()).to.equal(depositBalance)
      })
    })

    context("when there is a deposit plus 'donation' made", () => {
      beforeAfterSnapshotWrapper()

      before(async () => {
        await tbtc.mint(await stbtc.getAddress(), to1e18(5))
        await mezoAllocator.connect(maintainer).allocate()
        // donation
        await tbtc.mint(await mezoAllocator.getAddress(), to1e18(1))
      })

      it("should return the total assets value", async () => {
        const totalAssets = await mezoAllocator.totalAssets()
        expect(totalAssets).to.equal(to1e18(6))
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
      beforeAfterSnapshotWrapper()

      context("when there is no deposit", () => {
        beforeAfterSnapshotWrapper()

        context("when there is no donation", () => {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await mezoAllocator.connect(governance).releaseDeposit()
          })

          it("should not emit DepositReleased event", async () => {
            await expect(tx).to.not.emit(mezoAllocator, "DepositReleased")
          })

          it("should not call MezoPortal.withdraw function", async () => {
            await expect(tx).to.not.emit(mezoPortal, "WithdrawFully")
          })
        })

        context("when there is a donation", () => {
          beforeAfterSnapshotWrapper()

          const donationAmount = to1e18(2)

          let tx: ContractTransactionResponse

          before(async () => {
            await tbtc.mint(await mezoAllocator.getAddress(), donationAmount)

            tx = await mezoAllocator.connect(governance).releaseDeposit()
          })

          it("should not emit DepositReleased event", async () => {
            await expect(tx).to.not.emit(mezoAllocator, "DepositReleased")
          })

          it("should transfer tBTC to stBTC contract", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [mezoAllocator, stbtc],
              [-donationAmount, donationAmount],
            )
          })

          it("should not call MezoPortal.withdraw function", async () => {
            await expect(tx).to.not.emit(mezoPortal, "WithdrawFully")
          })
        })
      })

      context("when there is a deposit", () => {
        beforeAfterSnapshotWrapper()

        const depositAmount = to1e18(5)

        before(async () => {
          await tbtc.mint(await stbtc.getAddress(), depositAmount)
          await mezoAllocator.connect(maintainer).allocate()
        })

        context("when there is no donation", () => {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await mezoAllocator.connect(governance).releaseDeposit()
          })

          it("should emit DepositReleased event", async () => {
            await expect(tx)
              .to.emit(mezoAllocator, "DepositReleased")
              .withArgs(1, depositAmount)
          })

          it("should decrease tracked deposit balance amount to zero", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(0)
          })

          it("should transfer tBTC to stBTC contract", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [mezoPortal, stbtc],
              [-depositAmount, depositAmount],
            )
          })

          it("should call MezoPortal.withdraw function", async () => {
            await expect(tx)
              .to.emit(mezoPortal, "WithdrawFully")
              .withArgs(await tbtc.getAddress(), 1)
          })
        })

        context("when there is a donation", () => {
          beforeAfterSnapshotWrapper()

          const donationAmount = to1e18(2)

          let tx: ContractTransactionResponse

          before(async () => {
            await tbtc.mint(await mezoAllocator.getAddress(), donationAmount)

            tx = await mezoAllocator.connect(governance).releaseDeposit()
          })

          it("should emit DepositReleased event", async () => {
            await expect(tx)
              .to.emit(mezoAllocator, "DepositReleased")
              .withArgs(1, depositAmount)
          })

          it("should decrease tracked deposit balance amount to zero", async () => {
            const depositBalance = await mezoAllocator.depositBalance()
            expect(depositBalance).to.equal(0)
          })

          it("should transfer tBTC to stBTC contract", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [mezoPortal, mezoAllocator, stbtc],
              [-depositAmount, -donationAmount, depositAmount + donationAmount],
            )
          })

          it("should call MezoPortal.withdraw function", async () => {
            await expect(tx)
              .to.emit(mezoPortal, "WithdrawFully")
              .withArgs(await tbtc.getAddress(), 1)
          })
        })
      })
    })
  })
})
