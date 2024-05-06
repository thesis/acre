import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import {
  ContractTransactionResponse,
  encodeBytes32String,
  ZeroAddress,
} from "ethers"
import { ethers, helpers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"

import { to1e18 } from "./utils"

import type { StBTC as stBTC, BitcoinRedeemer, TestTBTC } from "../typechain"
import { tbtcRedemptionData } from "./data/tbtc"

const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { tbtc, stbtc, bitcoinRedeemer } = await deployment()

  const { governance } = await getNamedSigners()

  const [depositor, thirdParty] = await getUnnamedSigners()

  const amountToMint = to1e18(100000)
  await tbtc.mint(depositor, amountToMint)

  await stbtc.connect(governance).updateExitFeeBasisPoints(10n)

  return {
    stbtc,
    tbtc,
    bitcoinRedeemer,
    governance,
    depositor,
    thirdParty,
  }
}

describe("BitcoinRedeemer", () => {
  let stbtc: stBTC
  let tbtc: TestTBTC
  let bitcoinRedeemer: BitcoinRedeemer

  let governance: HardhatEthersSigner
  let depositor: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({ stbtc, tbtc, bitcoinRedeemer, governance, depositor, thirdParty } =
      await loadFixture(fixture))
  })

  describe("receiveApproval", () => {
    context("when called not for stBTC token", () => {
      it("should revert", async () => {
        await expect(
          bitcoinRedeemer
            .connect(depositor)
            .receiveApproval(
              depositor.address,
              to1e18(1),
              depositor.address,
              encodeBytes32String(""),
            ),
        ).to.be.revertedWithCustomError(bitcoinRedeemer, "UnsupportedToken")
      })
    })

    context("when called directly", () => {
      it("should revert", async () => {
        await expect(
          bitcoinRedeemer
            .connect(depositor)
            .receiveApproval(
              depositor.address,
              to1e18(1),
              await stbtc.getAddress(),
              encodeBytes32String(""),
            ),
        ).to.be.revertedWithCustomError(bitcoinRedeemer, "CallerNotAllowed")
      })
    })

    context("when called via approveAndCall", () => {
      context("when called with empty extraData", () => {
        it("should revert", async () => {
          await expect(
            stbtc
              .connect(depositor)
              .approveAndCall(
                await bitcoinRedeemer.getAddress(),
                to1e18(1),
                "0x",
              ),
          ).to.be.revertedWithCustomError(bitcoinRedeemer, "EmptyExtraData")
        })
      })

      context("when called with non-empty extraData", () => {
        context("when TBTC token owner doesn't match TBTCVault", () => {
          beforeAfterSnapshotWrapper()

          before(async () => {
            const newOwner = await ethers.Wallet.createRandom().getAddress()
            await tbtc.setOwner(newOwner)
          })

          it("should revert", async () => {
            await expect(
              stbtc
                .connect(depositor)
                .approveAndCall(
                  await bitcoinRedeemer.getAddress(),
                  to1e18(1),
                  tbtcRedemptionData.redemptionData,
                ),
            ).to.be.revertedWithCustomError(
              bitcoinRedeemer,
              "UnexpectedTbtcTokenOwner",
            )
          })
        })

        context("when TBTC token owner matches TBTCVault", () => {
          context("when caller has no deposit", () => {
            it("should revert", async () => {
              await expect(
                stbtc
                  .connect(depositor)
                  .approveAndCall(
                    await bitcoinRedeemer.getAddress(),
                    to1e18(1),
                    tbtcRedemptionData.redemptionData,
                  ),
              ).to.be.revertedWithCustomError(stbtc, "ERC20InsufficientBalance")
            })
          })

          context("when caller has deposit", () => {
            beforeAfterSnapshotWrapper()

            const depositAmount = to1e18(10)
            const earnedYield = to1e18(8)

            before(async () => {
              await tbtc
                .connect(depositor)
                .approve(await stbtc.getAddress(), depositAmount)
              await stbtc
                .connect(depositor)
                .deposit(depositAmount, depositor.address)

              await tbtc.mint(await stbtc.getAddress(), earnedYield)
            })

            context("when redeeming too many tokens", () => {
              const amountToRedeem = depositAmount + 1n

              const expectedTbtcWithdrawnAmount = depositAmount + earnedYield
              const expectedMaxTbtcWithdrawalAmount =
                depositAmount + earnedYield - 1n

              it("should revert", async () => {
                await expect(
                  stbtc
                    .connect(depositor)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      amountToRedeem,
                      tbtcRedemptionData.redemptionData,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    stbtc,
                    "ERC4626ExceededMaxWithdraw",
                  )
                  .withArgs(
                    depositor.address,
                    expectedTbtcWithdrawnAmount,
                    expectedMaxTbtcWithdrawalAmount,
                  )
              })
            })

            context("when tBTC.approveAndCall returns true", () => {
              beforeAfterSnapshotWrapper()

              context("when redeeming deposit fully", () => {
                beforeAfterSnapshotWrapper()

                const stBtcAmountToRedeem = depositAmount

                // Rounded down by SATOSHI_MULTIPLIER to avoid burning stBTC shares
                // for tBTC that won't be bridged to Bitcoin in tBTC Bridge due to
                // conversion of tBTC to satoshi.
                const expectedTbtcWithdrawnAmount = 17999999990000000000n
                const expectedStbtcRedeemedAmount = 9999999994444444445n
                const expectedStbtcRemainingAmount = 5555555555n

                let tx: ContractTransactionResponse

                before(async () => {
                  tx = await stbtc
                    .connect(depositor)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      stBtcAmountToRedeem,
                      tbtcRedemptionData.redemptionData,
                    )
                })

                it("should emit RedemptionRequested event", async () => {
                  await expect(tx)
                    .to.emit(bitcoinRedeemer, "RedemptionRequested")
                    .withArgs(
                      depositor.address,
                      expectedStbtcRedeemedAmount,
                      expectedTbtcWithdrawnAmount,
                    )
                })

                it("should change stBTC tokens balance", async () => {
                  await expect(tx).to.changeTokenBalances(
                    stbtc,
                    [depositor],
                    [-expectedStbtcRedeemedAmount],
                  )
                })

                it("should burn stBTC tokens", async () => {
                  expect(await stbtc.totalSupply()).to.be.equal(
                    depositAmount - expectedStbtcRedeemedAmount,
                  )
                })

                it("should transfer tBTC tokens", async () => {
                  await expect(tx).to.changeTokenBalances(
                    tbtc,
                    [stbtc, bitcoinRedeemer],
                    [-expectedTbtcWithdrawnAmount, expectedTbtcWithdrawnAmount],
                  )
                })

                it("should leave remainder stBTC tokens", async () => {
                  expect(await stbtc.balanceOf(depositor)).to.be.equal(
                    expectedStbtcRemainingAmount,
                  )
                })

                it("should call approveAndCall in tBTC contract", async () => {
                  await expect(tx)
                    .to.emit(tbtc, "ApproveAndCallCalled")
                    .withArgs(
                      await tbtc.owner(),
                      expectedTbtcWithdrawnAmount,
                      tbtcRedemptionData.redemptionData,
                    )
                })
              })

              context("when redeeming deposit partially", () => {
                beforeAfterSnapshotWrapper()

                const stBtcAmountToRedeem = to1e18(6)

                // 6 / 10 * (10 + 8) = 10.8
                // 10.7(9) to match stBTC calculations rounding.
                // Rounded down by SATOSHI_MULTIPLIER to avoid burning stBTC shares
                // for tBTC that won't be bridged to Bitcoin in tBTC Bridge due to
                // conversion of tBTC to satoshi.
                const expectedTbtcWithdrawnAmount = 10799999990000000000n
                // 10.7(9) * 10 / 18 = 5.9(9)
                const expectedStbtcRedeemedAmount = 5999999994444444445n
                // (10 - 6) + remainder
                const expectedStbtcRemainingAmount = 4000000005555555555n

                let tx: ContractTransactionResponse

                before(async () => {
                  tx = await stbtc
                    .connect(depositor)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      stBtcAmountToRedeem,
                      tbtcRedemptionData.redemptionData,
                    )
                })

                it("should emit RedemptionRequested event", async () => {
                  await expect(tx)
                    .to.emit(bitcoinRedeemer, "RedemptionRequested")
                    .withArgs(
                      depositor.address,
                      expectedStbtcRedeemedAmount,
                      expectedTbtcWithdrawnAmount,
                    )
                })

                it("should change stBTC tokens balance", async () => {
                  await expect(tx).to.changeTokenBalances(
                    stbtc,
                    [depositor],
                    [-expectedStbtcRedeemedAmount],
                  )
                })

                it("should burn stBTC tokens", async () => {
                  expect(await stbtc.totalSupply()).to.be.equal(
                    depositAmount - expectedStbtcRedeemedAmount,
                  )
                })

                it("should transfer tBTC tokens", async () => {
                  await expect(tx).to.changeTokenBalances(
                    tbtc,
                    [stbtc, bitcoinRedeemer],
                    [-expectedTbtcWithdrawnAmount, expectedTbtcWithdrawnAmount],
                  )
                })

                it("should leave remainder stBTC tokens", async () => {
                  expect(await stbtc.balanceOf(depositor)).to.be.equal(
                    expectedStbtcRemainingAmount,
                  )
                })

                it("should call approveAndCall in tBTC contract", async () => {
                  await expect(tx)
                    .to.emit(tbtc, "ApproveAndCallCalled")
                    .withArgs(
                      await tbtc.owner(),
                      expectedTbtcWithdrawnAmount,
                      tbtcRedemptionData.redemptionData,
                    )
                })
              })
            })

            context("when tBTC.approveAndCall returns false", () => {
              beforeAfterSnapshotWrapper()

              before(async () => {
                await tbtc.setApproveAndCallResult(false)
              })

              it("should revert", async () => {
                await expect(
                  stbtc
                    .connect(depositor)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      to1e18(6),
                      tbtcRedemptionData.redemptionData,
                    ),
                ).to.be.revertedWithCustomError(
                  bitcoinRedeemer,
                  "ApproveAndCallFailed",
                )
              })
            })
          })
        })
      })
    })
  })

  describe("updateTbtcVault", () => {
    beforeAfterSnapshotWrapper()

    context("when caller is not governance", () => {
      it("should revert", async () => {
        await expect(
          bitcoinRedeemer.connect(thirdParty).updateTbtcVault(ZeroAddress),
        )
          .to.be.revertedWithCustomError(
            bitcoinRedeemer,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is governance", () => {
      context("when a new tbtc vault is zero address", () => {
        it("should revert", async () => {
          await expect(
            bitcoinRedeemer.connect(governance).updateTbtcVault(ZeroAddress),
          ).to.be.revertedWithCustomError(bitcoinRedeemer, "ZeroAddress")
        })
      })

      context("when a new treasury is an allowed address", () => {
        let oldTbtcVault: string
        let newTbtcVault: string
        let tx: ContractTransactionResponse

        before(async () => {
          oldTbtcVault = await bitcoinRedeemer.tbtcVault()
          newTbtcVault = await ethers.Wallet.createRandom().getAddress()

          tx = await bitcoinRedeemer
            .connect(governance)
            .updateTbtcVault(newTbtcVault)
        })

        it("should update the tbtc vault", async () => {
          expect(await bitcoinRedeemer.tbtcVault()).to.be.equal(newTbtcVault)
        })

        it("should emit TbtcVaultUpdated event", async () => {
          await expect(tx)
            .to.emit(bitcoinRedeemer, "TbtcVaultUpdated")
            .withArgs(oldTbtcVault, newTbtcVault)
        })
      })
    })
  })
})
