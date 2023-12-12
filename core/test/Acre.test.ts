import {
  SnapshotRestorer,
  loadFixture,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { ContractTransactionResponse, ZeroAddress } from "ethers"
import type { TestERC20, Acre } from "../typechain"
import { to1e18 } from "./utils"

async function acreFixture() {
  const [owner, staker1, staker2] = await ethers.getSigners()

  const TestERC20 = await ethers.getContractFactory("TestERC20")
  const tbtc = await TestERC20.deploy()

  const Acre = await ethers.getContractFactory("Acre")
  const acre = await Acre.deploy(await tbtc.getAddress())

  const amountToMint = to1e18(100000)
  tbtc.mint(staker1, amountToMint)
  tbtc.mint(staker2, amountToMint)

  return { acre, tbtc, owner, staker1, staker2 }
}

describe("Acre", () => {
  let acre: Acre
  let tbtc: TestERC20
  let owner: HardhatEthersSigner
  let staker1: HardhatEthersSigner
  let staker2: HardhatEthersSigner

  before(async () => {
    ;({ acre, tbtc, owner, staker1, staker2 } = await loadFixture(acreFixture))
  })

  describe("stake", () => {
    const referral = ethers.encodeBytes32String("referral")
    let snapshot: SnapshotRestorer

    context("when staking as first staker", () => {
      beforeEach(async () => {
        snapshot = await takeSnapshot()
      })

      afterEach(async () => {
        await snapshot.restore()
      })

      context("with a referral", () => {
        const amountToStake = to1e18(1)

        // In this test case there is only one staker and
        // the token vault has not earned anythig yet so received shares are
        // equal to staked tokens amount.
        const expectedReceivedShares = amountToStake

        let tx: ContractTransactionResponse
        let tbtcHolder: HardhatEthersSigner
        let receiver: HardhatEthersSigner

        beforeEach(async () => {
          tbtcHolder = staker1
          receiver = staker2

          await tbtc
            .connect(tbtcHolder)
            .approve(await acre.getAddress(), amountToStake)

          tx = await acre
            .connect(tbtcHolder)
            .stake(amountToStake, receiver.address, referral)
        })

        it("should emit Deposit event", () => {
          expect(tx).to.emit(acre, "Deposit").withArgs(
            // Caller.
            tbtcHolder.address,
            // Receiver.
            receiver.address,
            // Staked tokens.
            amountToStake,
            // Received shares.
            expectedReceivedShares,
          )
        })

        it("should emit StakeReferral event", () => {
          expect(tx)
            .to.emit(acre, "StakeReferral")
            .withArgs(referral, amountToStake)
        })

        it("should mint stBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            acre,
            [receiver.address],
            [expectedReceivedShares],
          )
        })

        it("should transfer tBTC tokens", async () => {
          await expect(tx).to.changeTokenBalances(
            tbtc,
            [tbtcHolder.address, acre],
            [-amountToStake, amountToStake],
          )
        })
      })

      context("without referral", () => {
        const amountToStake = to1e18(10)
        const emptyReferral = ethers.encodeBytes32String("")
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          tx = await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, emptyReferral)
        })

        it("should not emit the StakeReferral event", async () => {
          await expect(tx).to.not.emit(acre, "StakeReferral")
        })
      })

      context(
        "when amount to stake is greater than the approved amount",
        () => {
          const approvedAmount = to1e18(10)
          const amountToStake = approvedAmount + 1n

          beforeEach(async () => {
            await tbtc
              .connect(staker1)
              .approve(await acre.getAddress(), approvedAmount)
          })

          it("should revert", async () => {
            await expect(
              acre
                .connect(staker1)
                .stake(amountToStake, staker1.address, referral),
            ).to.be.revertedWithCustomError(tbtc, "ERC20InsufficientAllowance")
          })
        },
      )

      context("when amount to stake is 1", () => {
        const amountToStake = 1

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            acre
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral),
          ).to.revertedWith("Amount is less than minimum")
        })
      })

      context("when amount to stake is less than minimum", () => {
        let amountToStake: bigint

        beforeEach(async () => {
          const { minimumDepositAmount } = await acre.stakingParameters()
          amountToStake = minimumDepositAmount - 1n

          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            acre
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral),
          ).to.revertedWith("Amount is less than minimum")
        })
      })

      context("when amount to stake is equal to the minimum amount", () => {
        let amountToStake: bigint
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          const { minimumDepositAmount } = await acre.stakingParameters()
          amountToStake = minimumDepositAmount

          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)

          tx = await acre
            .connect(staker1)
            .stake(amountToStake, staker1.address, referral)
        })

        it("should receive shares equal to the staked amount", async () => {
          await expect(tx).to.changeTokenBalances(
            acre,
            [staker1.address],
            [amountToStake],
          )
        })
      })

      context("when the receiver is zero address", () => {
        const amountToStake = to1e18(10)

        beforeEach(async () => {
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), amountToStake)
        })

        it("should revert", async () => {
          await expect(
            acre.connect(staker1).stake(amountToStake, ZeroAddress, referral),
          ).to.be.revertedWithCustomError(acre, "ERC20InvalidReceiver")
        })
      })

      context(
        "when a staker approved and staked tokens and wants to stake more but w/o another approval",
        () => {
          const amountToStake = to1e18(10)

          beforeEach(async () => {
            await tbtc
              .connect(staker1)
              .approve(await acre.getAddress(), amountToStake)

            await acre
              .connect(staker1)
              .stake(amountToStake, staker1.address, referral)
          })

          it("should revert", async () => {
            await expect(
              acre
                .connect(staker1)
                .stake(amountToStake, staker1.address, referral),
            ).to.be.revertedWithCustomError(acre, "ERC20InsufficientAllowance")
          })
        },
      )
    })

    context("when there are two stakers", () => {
      const staker1AmountToStake = to1e18(7)
      const staker2AmountToStake = to1e18(3)
      let afterStakesSnapshot: SnapshotRestorer
      let afterSimulatingYieldSnapshot: SnapshotRestorer

      before(async () => {
        await tbtc
          .connect(staker1)
          .approve(await acre.getAddress(), staker1AmountToStake)
        await tbtc
          .connect(staker2)
          .approve(await acre.getAddress(), staker2AmountToStake)

        // Mint tokens.
        await tbtc.connect(staker1).mint(staker1.address, staker1AmountToStake)
        await tbtc.connect(staker2).mint(staker2.address, staker2AmountToStake)
      })

      context(
        "when the vault is empty and has not yet earned yield from strategies",
        () => {
          after(async () => {
            afterStakesSnapshot = await takeSnapshot()
          })

          context("when staker A stakes tokens", () => {
            it("should receive shares equal to a staked amount", async () => {
              const tx = await acre
                .connect(staker1)
                .stake(staker1AmountToStake, staker1.address, referral)

              await expect(tx).to.changeTokenBalances(
                acre,
                [staker1.address],
                [staker1AmountToStake],
              )
            })
          })

          context("when staker B stakes tokens", () => {
            it("should receive shares equal to a staked amount", async () => {
              const tx = await acre
                .connect(staker2)
                .stake(staker2AmountToStake, staker2.address, referral)

              await expect(tx).to.changeTokenBalances(
                acre,
                [staker2.address],
                [staker2AmountToStake],
              )
            })
          })
        },
      )

      context("when the vault has stakes", () => {
        before(async () => {
          await afterStakesSnapshot.restore()
        })

        it("the total assets amount should be equal to all staked tokens", async () => {
          const totalAssets = await acre.totalAssets()

          expect(totalAssets).to.eq(staker1AmountToStake + staker2AmountToStake)
        })
      })

      context("when vault earns yield", () => {
        let staker1SharesBefore: bigint
        let staker2SharesBefore: bigint
        let vaultYield: bigint

        before(async () => {
          // Current state:
          // Staker A shares = 7
          // Staker B shares = 3
          // Total assets = 7(staker A) + 3(staker B) + 5(yield)
          await afterStakesSnapshot.restore()

          staker1SharesBefore = await acre.balanceOf(staker1.address)
          staker2SharesBefore = await acre.balanceOf(staker2.address)
          vaultYield = to1e18(5)

          // Simulating yield returned from strategies. The vault now contains
          // more tokens than deposited which causes the exchange rate to
          // change.
          await tbtc.mint(await acre.getAddress(), vaultYield)
        })

        after(async () => {
          afterSimulatingYieldSnapshot = await takeSnapshot()
        })

        it("the vault should hold more assets", async () => {
          expect(await acre.totalAssets()).to.be.eq(
            staker1AmountToStake + staker2AmountToStake + vaultYield,
          )
        })

        it("the staker's shares should be the same", async () => {
          expect(await acre.balanceOf(staker1.address)).to.be.eq(
            staker1SharesBefore,
          )
          expect(await acre.balanceOf(staker2.address)).to.be.eq(
            staker2SharesBefore,
          )
        })

        it("the staker A should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(staker1.address)
          const availableAssetsToRedeem = await acre.previewRedeem(shares)

          // Expected amount w/o rounding: 7 * 15 / 10 = 10.5
          // Expected amount w/ support for rounding: 10499999999999999999 in
          // tBTC token precision.
          const expectedAssetsToRedeem = 10499999999999999999n

          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })

        it("the staker B should be able to redeem more tokens than before", async () => {
          const shares = await acre.balanceOf(staker2.address)
          const availableAssetsToRedeem = await acre.previewRedeem(shares)

          // Expected amount w/o rounding: 3 * 15 / 10 = 4.5
          // Expected amount w/ support for rounding: 4499999999999999999 in
          // tBTC token precision.
          const expectedAssetsToRedeem = 4499999999999999999n

          expect(availableAssetsToRedeem).to.be.eq(expectedAssetsToRedeem)
        })
      })

      context("when staker A stakes more tokens", () => {
        context(
          "when total tBTC amount after staking would not exceed max amount",
          () => {
            const newAmountToStake = to1e18(2)
            // Current state:
            // Total assets = 7(staker A) + 3(staker B) + 5(yield)
            // Total shares = 7 + 3 = 10
            // Shares to mint = 2 * 10 / 15 = 1.(3) -> 1333333333333333333 in stBTC
            // token precision
            const expectedSharesToMint = 1333333333333333333n
            let sharesBefore: bigint
            let availableToRedeemBefore: bigint

            before(async () => {
              await afterSimulatingYieldSnapshot.restore()

              sharesBefore = await acre.balanceOf(staker1.address)
              availableToRedeemBefore = await acre.previewRedeem(sharesBefore)

              tbtc.mint(staker1.address, newAmountToStake)

              await tbtc
                .connect(staker1)
                .approve(await acre.getAddress(), newAmountToStake)

              // State after stake:
              // Total assets = 7(staker A) + 3(staker B) + 5(yield) + 2(staker
              // A) = 17
              // Total shares = 7 + 3 + 1.(3) = 11.(3)
              await acre
                .connect(staker1)
                .stake(newAmountToStake, staker1.address, referral)
            })

            it("should receive more shares", async () => {
              const shares = await acre.balanceOf(staker1.address)

              expect(shares).to.be.eq(sharesBefore + expectedSharesToMint)
            })

            it("should be able to redeem more tokens than before", async () => {
              const shares = await acre.balanceOf(staker1.address)
              const availableToRedeem = await acre.previewRedeem(shares)

              // Expected amount w/o rounding: 8.(3) * 17 / 11.(3) = 12.5
              // Expected amount w/ support for rounding: 12499999999999999999 in
              // tBTC token precision.
              const expectedTotalAssetsAvailableToRedeem = 12499999999999999999n

              expect(availableToRedeem).to.be.greaterThan(
                availableToRedeemBefore,
              )
              expect(availableToRedeem).to.be.eq(
                expectedTotalAssetsAvailableToRedeem,
              )
            })
          },
        )

        context(
          "when total tBTC amount after staking would exceed max amount",
          () => {
            let possibleMaxAmountToStake: bigint
            let amountToStake: bigint

            before(async () => {
              await afterSimulatingYieldSnapshot.restore()

              // In the current implementation of the `maxDeposit` the
              // `address` param is not taken into account - it means it will
              // return the same value for any address.
              possibleMaxAmountToStake = await acre.maxDeposit(staker1.address)
              amountToStake = possibleMaxAmountToStake + 1n

              await tbtc
                .connect(staker1)
                .approve(await acre.getAddress(), amountToStake)
            })

            it("should revert", async () => {
              await expect(
                acre.stake(amountToStake, staker1.address, referral),
              ).to.be.revertedWithCustomError(acre, "ERC4626ExceededMaxDeposit")
            })
          },
        )
      })
    })
  })

  describe("mint", () => {
    let snapshot: SnapshotRestorer

    beforeEach(async () => {
      snapshot = await takeSnapshot()
    })

    afterEach(async () => {
      await snapshot.restore()
    })

    context("when staker wants to mint more shares than allowed", () => {
      let sharesToMint: bigint

      beforeEach(async () => {
        const maxMint = await acre.maxMint(staker1.address)

        sharesToMint = maxMint + 1n
      })

      it("should take into account the max total assets parameter and revert", async () => {
        await expect(
          acre.connect(staker1).mint(sharesToMint, staker1.address),
        ).to.be.revertedWithCustomError(acre, "ERC4626ExceededMaxMint")
      })
    })

    context(
      "when staker wants to mint less shares than is equal to the min deposit amount",
      () => {
        let sharesToMint: bigint

        beforeEach(async () => {
          const { minimumDepositAmount } = await acre.stakingParameters()
          const previewDeposit = await acre.previewDeposit(minimumDepositAmount)

          sharesToMint = previewDeposit - 1n
          await tbtc
            .connect(staker1)
            .approve(await acre.getAddress(), minimumDepositAmount)
        })

        it("should take into account the min deposit amount parameter and revert", async () => {
          await expect(
            acre.connect(staker1).mint(sharesToMint, staker1.address),
          ).to.be.revertedWith("Amount is less than minimum")
        })
      },
    )
  })

  describe("updateStakingParameters", () => {
    const validMinimumDepositAmount = to1e18(1)
    const validMaximumTotalAssetsAmount = to1e18(30)

    context("when is called by owner", () => {
      context("when all parameters are valid", () => {
        let tx: ContractTransactionResponse

        beforeEach(async () => {
          tx = await acre
            .connect(owner)
            .updateStakingParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            )
        })

        it("should emit StakingParametersUpdated event", async () => {
          await expect(tx)
            .to.emit(acre, "StakingParametersUpdated")
            .withArgs(validMinimumDepositAmount, validMaximumTotalAssetsAmount)
        })

        it("should update parameters correctly", async () => {
          const stakingParameters = await acre.stakingParameters()

          expect(stakingParameters.minimumDepositAmount).to.be.eq(
            validMinimumDepositAmount,
          )
          expect(stakingParameters.maximumTotalAssets).to.be.eq(
            validMaximumTotalAssetsAmount,
          )
        })
      })

      context("when minimum deposit amount is invalid", () => {
        context("when it is equal to 0", () => {
          const minimumDepositAmount = 0

          it("should revert", async () => {
            await expect(
              acre
                .connect(owner)
                .updateStakingParameters(
                  minimumDepositAmount,
                  validMaximumTotalAssetsAmount,
                ),
            ).to.be.revertedWith(
              "Minimum deposit amount must be greater than zero",
            )
          })
        })

        context(
          "when it is less than the minimum deposit amount in tBTC system",
          () => {
            // TODO: In the current implementation the minimum deposit amount
            // from tBTC system is hardcoded to 0.01 tBTC. We should get this
            // value from mocked tBTC Bridge contract.
            const minimumDepositAmountInTBTCSystem = 10000000000000000n

            const newMinimumDepositAmount =
              minimumDepositAmountInTBTCSystem - 1n

            it("should revert", async () => {
              await expect(
                acre
                  .connect(owner)
                  .updateStakingParameters(
                    newMinimumDepositAmount,
                    validMaximumTotalAssetsAmount,
                  ),
              ).to.be.revertedWith(
                "Minimum deposit amount must be greater than or to the equal minimum deposit amount in tBTC system",
              )
            })
          },
        )
      })

      context("when the maximum total assets amount is invalid", () => {
        const maximumTotalAssets = 0

        context("when it is equal to 0", () => {
          it("should revert", async () => {
            await expect(
              acre
                .connect(owner)
                .updateStakingParameters(
                  validMinimumDepositAmount,
                  maximumTotalAssets,
                ),
            ).to.be.revertedWith(
              "Maximum total assets amount must be greater than zero",
            )
          })
        })
      })
    })

    context("when it is called by non-owner", () => {
      it("should revert", async () => {
        await expect(
          acre
            .connect(staker1)
            .updateStakingParameters(
              validMinimumDepositAmount,
              validMaximumTotalAssetsAmount,
            ),
        ).to.be.revertedWithCustomError(acre, "OwnableUnauthorizedAccount")
      })
    })
  })
})
