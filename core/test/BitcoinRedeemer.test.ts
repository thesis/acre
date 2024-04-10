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
              it("should revert", async () => {
                await expect(
                  stbtc
                    .connect(depositor)
                    .approveAndCall(
                      await bitcoinRedeemer.getAddress(),
                      amountToRedeem,
                      tbtcRedemptionData.redemptionData,
                    ),
                ).to.be.revertedWithCustomError(
                  stbtc,
                  "ERC20InsufficientBalance",
                )
              })
            })

            context("when redeeming deposit partially", () => {
              const stBtcAmountToRedeem = to1e18(6)
              // 6 / 10 * (10 + 8) = 10.8
              // 10.7(9) to match stBTC calculations rounding.
              const tbtcAmountToRedeem = 10799999999999999999n

              context("when tBTC.approveAndCall returns true", () => {
                beforeAfterSnapshotWrapper()

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
                      stBtcAmountToRedeem,
                      tbtcAmountToRedeem,
                    )
                })

                it("should change stBTC tokens balance", async () => {
                  await expect(tx).to.changeTokenBalances(
                    stbtc,
                    [depositor],
                    [-stBtcAmountToRedeem],
                  )
                })

                it("should burn stBTC tokens", async () => {
                  expect(await stbtc.totalSupply()).to.be.equal(
                    depositAmount - stBtcAmountToRedeem,
                  )
                })

                it("should transfer tBTC tokens", async () => {
                  await expect(tx).to.changeTokenBalances(
                    tbtc,
                    [stbtc, bitcoinRedeemer],
                    [-tbtcAmountToRedeem, tbtcAmountToRedeem],
                  )
                })

                it("should call approveAndCall in tBTC contract", async () => {
                  await expect(tx)
                    .to.emit(tbtc, "ApproveAndCallCalled")
                    .withArgs(
                      await tbtc.owner(),
                      tbtcAmountToRedeem,
                      tbtcRedemptionData.redemptionData,
                    )
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
                        stBtcAmountToRedeem,
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
