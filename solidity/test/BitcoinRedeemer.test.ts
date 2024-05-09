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

const { impersonateAccount } = helpers.account
const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { tbtc, stbtc, bitcoinRedeemer } = await deployment()

  const { deployer, governance } = await getNamedSigners()

  const [thirdParty, depositor2] = await getUnnamedSigners()

  // Impersonate the tbtcRedemptionData.redeemer account to match the redemption
  // test data.
  await impersonateAccount(tbtcRedemptionData.redeemer, {
    from: deployer,
  })
  const depositor1 = await ethers.getSigner(tbtcRedemptionData.redeemer)

  const amountToMint = to1e18(100000)
  await tbtc.mint(depositor1, amountToMint)
  await tbtc.mint(depositor2, amountToMint)

  return {
    stbtc,
    tbtc,
    bitcoinRedeemer,
    governance,
    depositor1,
    depositor2,
    thirdParty,
  }
}

describe("BitcoinRedeemer", () => {
  let stbtc: stBTC
  let tbtc: TestTBTC
  let bitcoinRedeemer: BitcoinRedeemer

  let governance: HardhatEthersSigner
  let depositor1: HardhatEthersSigner
  let depositor2: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({
      stbtc,
      tbtc,
      bitcoinRedeemer,
      governance,
      depositor1,
      depositor2,
      thirdParty,
    } = await loadFixture(fixture))
  })

  describe("receiveApproval", () => {
    beforeAfterSnapshotWrapper()

    const depositAmount1 = to1e18(10)
    const depositAmount2 = to1e18(5)
    const earnedYield = to1e18(8)

    before(async () => {
      await tbtc
        .connect(depositor1)
        .approve(await stbtc.getAddress(), depositAmount1)
      await stbtc
        .connect(depositor1)
        .deposit(depositAmount1, depositor1.address)

      await tbtc
        .connect(depositor2)
        .approve(await stbtc.getAddress(), depositAmount2)
      await stbtc
        .connect(depositor2)
        .deposit(depositAmount2, depositor2.address)

      await tbtc.mint(await stbtc.getAddress(), earnedYield)
    })

    context("when called not for stBTC token", () => {
      it("should revert", async () => {
        await expect(
          bitcoinRedeemer
            .connect(depositor1)
            .receiveApproval(
              depositor1.address,
              to1e18(1),
              depositor1.address,
              encodeBytes32String(""),
            ),
        ).to.be.revertedWithCustomError(bitcoinRedeemer, "CallerNotAllowed")
      })
    })

    context("when called directly", () => {
      it("should revert", async () => {
        await expect(
          bitcoinRedeemer
            .connect(depositor1)
            .receiveApproval(
              depositor1.address,
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
              .connect(depositor1)
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
                .connect(depositor1)
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
                  .connect(thirdParty)
                  .approveAndCall(
                    await bitcoinRedeemer.getAddress(),
                    to1e18(1),
                    tbtcRedemptionData.redemptionData.replace(
                      depositor1.address.toLowerCase().slice(2),
                      thirdParty.address.toLowerCase().slice(2),
                    ),
                  ),
              )
                .to.be.revertedWithCustomError(
                  stbtc,
                  "ERC4626ExceededMaxRedeem",
                )
                .withArgs(thirdParty.address, to1e18(1), 0)
            })
          })

          context("when caller has deposit", () => {
            beforeAfterSnapshotWrapper()

            context("when redeemer doesn't match token owner", () => {
              it("should revert", async () => {
                // Replace the redeemer address in the redemption data.
                const invalidRedemptionData =
                  tbtcRedemptionData.redemptionData.replace(
                    depositor1.address.toLowerCase().slice(2),
                    depositor2.address.toLowerCase().slice(2),
                  )

                await expect(
                  stbtc
                    .connect(depositor1)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      depositAmount1,
                      invalidRedemptionData,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    bitcoinRedeemer,
                    "RedeemerNotOwner",
                  )
                  .withArgs(depositor2.address, depositor1.address)
              })
            })

            context("when redeeming too many tokens", () => {
              const amountToRedeem = depositAmount1 + 1n

              it("should revert", async () => {
                await expect(
                  stbtc
                    .connect(depositor1)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      amountToRedeem,
                      tbtcRedemptionData.redemptionData,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    stbtc,
                    "ERC4626ExceededMaxRedeem",
                  )
                  .withArgs(depositor1.address, amountToRedeem, depositAmount1)
              })
            })

            context("when tBTC.approveAndCall returns true", () => {
              beforeAfterSnapshotWrapper()

              context("when redeeming deposit fully", () => {
                beforeAfterSnapshotWrapper()

                const stBtcAmountToRedeem = depositAmount1

                // 10 / (10 + 5) * (10 + 5 + 8) = 15.(3)
                const expectedTbtcWithdrawnAmount = 15333333333333333332n
                const expectedStbtcRedeemedAmount = stBtcAmountToRedeem
                const expectedStbtcRemainingAmount = 0n

                let tx: ContractTransactionResponse

                before(async () => {
                  tx = await stbtc
                    .connect(depositor1)
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
                      depositor1.address,
                      expectedStbtcRedeemedAmount,
                      expectedTbtcWithdrawnAmount,
                    )
                })

                it("should change stBTC tokens balance", async () => {
                  await expect(tx).to.changeTokenBalances(
                    stbtc,
                    [depositor1],
                    [-expectedStbtcRedeemedAmount],
                  )
                })

                it("should burn stBTC tokens", async () => {
                  expect(await stbtc.totalSupply()).to.be.equal(
                    depositAmount1 +
                      depositAmount2 -
                      expectedStbtcRedeemedAmount,
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
                  expect(await stbtc.balanceOf(depositor1)).to.be.equal(
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

                // 6 / (10 + 5) * (10 + 5 + 8) = 9.2
                // 9.1(9) to match stBTC calculations rounding.
                const expectedTbtcWithdrawnAmount = 9199999999999999999n
                const expectedStbtcRedeemedAmount = stBtcAmountToRedeem
                // (10 - 6)
                const expectedStbtcRemainingAmount = to1e18(4)

                let tx: ContractTransactionResponse

                before(async () => {
                  tx = await stbtc
                    .connect(depositor1)
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
                      depositor1.address,
                      expectedStbtcRedeemedAmount,
                      expectedTbtcWithdrawnAmount,
                    )
                })

                it("should change stBTC tokens balance", async () => {
                  await expect(tx).to.changeTokenBalances(
                    stbtc,
                    [depositor1],
                    [-expectedStbtcRedeemedAmount],
                  )
                })

                it("should burn stBTC tokens", async () => {
                  expect(await stbtc.totalSupply()).to.be.equal(
                    depositAmount1 +
                      depositAmount2 -
                      expectedStbtcRedeemedAmount,
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
                  expect(await stbtc.balanceOf(depositor1)).to.be.equal(
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
                    .connect(depositor1)
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
