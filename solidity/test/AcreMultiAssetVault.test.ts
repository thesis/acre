import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse, ZeroAddress } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"

import { TestERC20, AcreMultiAssetVault, MezoPortalStub } from "../typechain"

import { to1e18 } from "./utils"

const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { multiAssetVault, mezoPortal } = await deployment()

  const { governance } = await getNamedSigners()
  const [_, depositor1, depositor2, receiver, thirdParty] =
    await getUnnamedSigners()

  const asset1 = await ethers.deployContract("TestERC20", ["Asset1", "A1"])
  const asset2 = await ethers.deployContract("TestERC20", ["Asset2", "A2"])

  await multiAssetVault
    .connect(governance)
    .addSupportedAsset(await asset1.getAddress())

  await multiAssetVault
    .connect(governance)
    .addSupportedAsset(await asset2.getAddress())

  return {
    governance,
    thirdParty,
    depositor1,
    depositor2,
    receiver,
    multiAssetVault,
    mezoPortal,
    asset1,
    asset2,
  }
}

describe("AcreMultiAssetVault", () => {
  // Shift the initial Mezo deposit count to avoid conflicts of Mezo Portal deposit ids
  // with the deposit ids of the Multi Asset Vault.
  const initialMezoDepositCount = 3000n

  let multiAssetVault: AcreMultiAssetVault
  let asset1: TestERC20
  let asset2: TestERC20
  let mezoPortal: MezoPortalStub

  let governance: HardhatEthersSigner
  let depositor1: HardhatEthersSigner
  let depositor2: HardhatEthersSigner
  let receiver: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({
      multiAssetVault,
      asset1,
      asset2,
      mezoPortal,
      governance,
      depositor1,
      depositor2,
      receiver,
      thirdParty,
    } = await loadFixture(fixture))

    await mezoPortal.setDepositCount(initialMezoDepositCount)
  })

  describe("addSupportedAsset", () => {
    beforeAfterSnapshotWrapper()

    context("when the caller is not the governance", () => {
      it("should revert", async () => {
        await expect(
          multiAssetVault
            .connect(thirdParty)
            .addSupportedAsset(await asset1.getAddress()),
        )
          .to.be.revertedWithCustomError(
            multiAssetVault,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(await thirdParty.getAddress())
      })
    })

    context("when the caller is the governance", () => {
      context("when the asset is zero address", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.connect(governance).addSupportedAsset(ZeroAddress),
          ).to.be.revertedWithCustomError(multiAssetVault, "ZeroAddress")
        })
      })

      context("when the asset is already supported", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault
              .connect(governance)
              .addSupportedAsset(await asset1.getAddress()),
          ).to.be.revertedWithCustomError(
            multiAssetVault,
            "AssetAlreadySupported",
          )
        })
      })

      context("when the asset is not yet supported", () => {
        beforeAfterSnapshotWrapper()

        let newAssetAddress: string
        let tx: ContractTransactionResponse

        before(async () => {
          newAssetAddress = await ethers.Wallet.createRandom().getAddress()

          tx = await multiAssetVault
            .connect(governance)
            .addSupportedAsset(newAssetAddress)
        })

        it("should emit SupportedAssetAdded event", async () => {
          await expect(tx)
            .to.emit(multiAssetVault, "SupportedAssetAdded")
            .withArgs(newAssetAddress)
        })

        it("should add the asset to the supported assets", async () => {
          expect(await multiAssetVault.supportedAssets(newAssetAddress)).to.be
            .true
        })
      })
    })
  })

  describe("removeSupportedAsset", () => {
    beforeAfterSnapshotWrapper()

    context("when the caller is not the governance", () => {
      it("should revert", async () => {
        await expect(
          multiAssetVault
            .connect(thirdParty)
            .removeSupportedAsset(await asset1.getAddress()),
        )
          .to.be.revertedWithCustomError(
            multiAssetVault,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(await thirdParty.getAddress())
      })
    })

    context("when the caller is the governance", () => {
      context("when the asset is not supported", () => {
        it("should revert", async () => {
          const notSupportedAsset =
            await ethers.Wallet.createRandom().getAddress()

          await expect(
            multiAssetVault
              .connect(governance)
              .removeSupportedAsset(notSupportedAsset),
          ).to.be.revertedWithCustomError(multiAssetVault, "AssetNotSupported")
        })
      })

      context("when the asset is supported", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
          tx = await multiAssetVault
            .connect(governance)
            .removeSupportedAsset(await asset1.getAddress())
        })

        it("should emit SupportedAssetRemoved event", async () => {
          await expect(tx)
            .to.emit(multiAssetVault, "SupportedAssetRemoved")
            .withArgs(await asset1.getAddress())
        })

        it("should remove the asset from the supported assets", async () => {
          expect(
            await multiAssetVault.supportedAssets(await asset1.getAddress()),
          ).to.be.false
        })
      })
    })
  })

  describe("deposit", () => {
    beforeAfterSnapshotWrapper()

    let caller: HardhatEthersSigner
    let depositAmount: bigint

    let initialDepositCount: bigint
    let expectedDepositId: bigint

    let callResult: bigint
    let tx: ContractTransactionResponse

    before(async () => {
      caller = depositor1
      depositAmount = to1e18(10)

      initialDepositCount = await multiAssetVault.depositCount()
      expectedDepositId = initialDepositCount + 1n

      await asset1.mint(await caller.getAddress(), depositAmount)
      await asset1
        .connect(caller)
        .approve(await multiAssetVault.getAddress(), depositAmount)

      callResult = await multiAssetVault
        .connect(caller)
        .deposit.staticCall(await asset1.getAddress(), depositAmount)
      tx = await multiAssetVault
        .connect(caller)
        .deposit(await asset1.getAddress(), depositAmount)
    })

    it("should return the deposit id", () => {
      expect(callResult).to.be.equal(expectedDepositId)
    })

    it("should increment deposit count", async () => {
      expect(await multiAssetVault.depositCount()).to.be.equal(
        initialDepositCount + 1n,
      )
    })

    it("should emit DepositCreated event", async () => {
      await expect(tx)
        .to.emit(multiAssetVault, "DepositCreated")
        .withArgs(
          await caller.getAddress(),
          await asset1.getAddress(),
          expectedDepositId,
          depositAmount,
        )
    })

    it("should transfer the asset to the Mezo Portal", async () => {
      await expect(tx).to.changeTokenBalances(
        asset1,
        [caller, multiAssetVault, mezoPortal],
        [-depositAmount, 0, depositAmount],
      )
    })

    it("should store deposit data", async () => {
      const depositData = await multiAssetVault.getDeposit(
        await caller.getAddress(),
        await asset1.getAddress(),
        expectedDepositId,
      )

      expect(depositData.balance, "invalid balance").to.equal(depositAmount)
      expect(depositData.mezoDepositId, "invalid mezo deposit id").to.equal(
        initialMezoDepositCount + 1n,
      )
    })
  })

  describe("depositFor", () => {
    beforeAfterSnapshotWrapper()

    context("when parameters are invalid", () => {
      beforeAfterSnapshotWrapper()

      context("when the asset is not supported", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.depositFor(
              ethers.Wallet.createRandom().address,
              to1e18(1),
              await depositor1.getAddress(),
            ),
          ).to.be.revertedWithCustomError(multiAssetVault, "AssetNotSupported")
        })
      })

      context("when the amount is zero", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.depositFor(
              await asset1.getAddress(),
              0,
              await depositor1.getAddress(),
            ),
          )
            .to.be.revertedWithCustomError(multiAssetVault, "InvalidAmount")
            .withArgs(0)
        })
      })

      context("when the deposit owner is zero address", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.depositFor(
              await asset1.getAddress(),
              to1e18(1),
              ZeroAddress,
            ),
          )
            .to.be.revertedWithCustomError(
              multiAssetVault,
              "InvalidDepositOwner",
            )
            .withArgs(ZeroAddress)
        })
      })

      context("when the deposit owner is the same as asset", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.depositFor(
              await asset1.getAddress(),
              to1e18(1),
              await asset1.getAddress(),
            ),
          )
            .to.be.revertedWithCustomError(
              multiAssetVault,
              "InvalidDepositOwner",
            )
            .withArgs(await asset1.getAddress())
        })
      })

      context("when called by a third party", () => {
        it("should revert", async () => {
          const depositAmount = to1e18(10)

          await asset1.mint(await depositor1.getAddress(), depositAmount)
          await asset1
            .connect(depositor1)
            .approve(await multiAssetVault.getAddress(), depositAmount)

          await expect(
            multiAssetVault
              .connect(thirdParty)
              .depositFor(
                await asset1.getAddress(),
                depositAmount,
                await depositor1.getAddress(),
              ),
          )
            .to.be.revertedWithCustomError(asset1, "ERC20InsufficientAllowance")
            .withArgs(await multiAssetVault.getAddress(), 0, depositAmount)
        })
      })
    })

    context("when parameters are valid", () => {
      beforeAfterSnapshotWrapper()

      describe("when the deposit owner is the same as the caller", () => {
        beforeAfterSnapshotWrapper()

        let caller: HardhatEthersSigner
        let depositOwner: HardhatEthersSigner
        let depositAmount: bigint

        let initialDepositCount: bigint
        let expectedDepositId: bigint

        let callResult: bigint
        let tx: ContractTransactionResponse

        before(async () => {
          caller = depositor1
          depositOwner = depositor1
          depositAmount = to1e18(10)

          initialDepositCount = await multiAssetVault.depositCount()
          expectedDepositId = initialDepositCount + 1n

          await asset1.mint(await caller.getAddress(), depositAmount)
          await asset1
            .connect(caller)
            .approve(await multiAssetVault.getAddress(), depositAmount)
          ;({ callResult, tx } = await createDepositFor({
            caller,
            asset: asset1,
            depositAmount,
            depositOwner,
          }))
        })

        it("should return the deposit id", () => {
          expect(callResult).to.be.equal(expectedDepositId)
        })

        it("should increment deposit count", async () => {
          expect(await multiAssetVault.depositCount()).to.be.equal(
            initialDepositCount + 1n,
          )
        })

        it("should emit DepositCreated event", async () => {
          await expect(tx)
            .to.emit(multiAssetVault, "DepositCreated")
            .withArgs(
              await depositOwner.getAddress(),
              await asset1.getAddress(),
              expectedDepositId,
              depositAmount,
            )
        })

        it("should transfer the asset to the Mezo Portal", async () => {
          await expect(tx).to.changeTokenBalances(
            asset1,
            [caller, multiAssetVault, mezoPortal],
            [-depositAmount, 0, depositAmount],
          )
        })

        it("should store deposit data", async () => {
          const depositData = await multiAssetVault.getDeposit(
            await depositOwner.getAddress(),
            await asset1.getAddress(),
            expectedDepositId,
          )

          expect(depositData.balance, "invalid balance").to.equal(depositAmount)
          expect(depositData.mezoDepositId, "invalid mezo deposit id").to.equal(
            initialMezoDepositCount + 1n,
          )
        })
      })

      describe("when the deposit owner is different from the caller", () => {
        beforeAfterSnapshotWrapper()

        let caller: HardhatEthersSigner
        let depositOwner: HardhatEthersSigner
        let depositAmount: bigint

        let initialDepositCount: bigint
        let expectedDepositId: bigint

        let callResult: bigint
        let tx: ContractTransactionResponse

        before(async () => {
          caller = depositor1
          depositOwner = depositor2
          depositAmount = to1e18(10)

          initialDepositCount = await multiAssetVault.depositCount()
          expectedDepositId = initialDepositCount + 1n

          await asset1.mint(await caller.getAddress(), depositAmount)
          await asset1
            .connect(caller)
            .approve(await multiAssetVault.getAddress(), depositAmount)

          callResult = await multiAssetVault
            .connect(caller)
            .depositFor.staticCall(
              await asset1.getAddress(),
              depositAmount,
              await depositOwner.getAddress(),
            )
          tx = await multiAssetVault
            .connect(caller)
            .depositFor(
              await asset1.getAddress(),
              depositAmount,
              await depositOwner.getAddress(),
            )
        })

        it("should return the deposit id", () => {
          expect(callResult).to.be.equal(expectedDepositId)
        })

        it("should increment deposit count", async () => {
          expect(await multiAssetVault.depositCount()).to.be.equal(
            initialDepositCount + 1n,
          )
        })

        it("should emit DepositCreated event", async () => {
          await expect(tx)
            .to.emit(multiAssetVault, "DepositCreated")
            .withArgs(
              await depositOwner.getAddress(),
              await asset1.getAddress(),
              expectedDepositId,
              depositAmount,
            )
        })

        it("should transfer the asset to the Mezo Portal", async () => {
          await expect(tx).to.changeTokenBalances(
            asset1,
            [caller, multiAssetVault, mezoPortal],
            [-depositAmount, 0, depositAmount],
          )
        })

        it("should store deposit data", async () => {
          const depositData = await multiAssetVault.getDeposit(
            await depositOwner.getAddress(),
            await asset1.getAddress(),
            expectedDepositId,
          )

          expect(depositData.balance, "invalid balance").to.equal(depositAmount)
          expect(depositData.mezoDepositId, "invalid mezo deposit id").to.equal(
            initialMezoDepositCount + 1n,
          )
        })
      })
    })

    context("when multiple deposits are created", () => {
      beforeAfterSnapshotWrapper()
      let caller: HardhatEthersSigner

      before(() => {
        caller = thirdParty
      })

      it("should create correct deposit 1", async () => {
        await testCreateDepositFor(asset1, to1e18(10), depositor1, 1n)
      })

      it("should create correct deposit 2", async () => {
        await testCreateDepositFor(asset1, to1e18(11), depositor2, 2n)
      })

      it("should create correct deposit 3", async () => {
        await testCreateDepositFor(asset2, to1e18(12), depositor2, 3n)
      })

      it("should create correct deposit 4", async () => {
        await testCreateDepositFor(asset2, to1e18(13), depositor1, 4n)
      })

      it("should create correct deposit 5", async () => {
        await testCreateDepositFor(asset1, to1e18(14), depositor2, 5n)
      })

      async function testCreateDepositFor(
        asset: TestERC20,
        depositAmount: bigint,
        depositOwner: HardhatEthersSigner,
        expectedDepositId: bigint,
      ) {
        const { callResult, tx } = await createDepositFor({
          caller,
          asset,
          depositAmount,
          depositOwner,
        })

        expect(callResult, "invalid returned value").to.be.equal(
          expectedDepositId,
        )

        await expect(tx, "invalid DepositCreated event")
          .to.emit(multiAssetVault, "DepositCreated")
          .withArgs(
            await depositOwner.getAddress(),
            await asset.getAddress(),
            expectedDepositId,
            depositAmount,
          )

        const depositData = await multiAssetVault.getDeposit(
          await depositOwner.getAddress(),
          await asset.getAddress(),
          expectedDepositId,
        )

        expect(depositData.balance, "invalid balance").to.equal(depositAmount)
        expect(depositData.mezoDepositId, "invalid mezo deposit id").to.equal(
          initialMezoDepositCount + expectedDepositId,
        )
      }
    })
  })

  describe("withdraw", () => {
    beforeAfterSnapshotWrapper()

    context("when parameters are invalid", () => {
      beforeAfterSnapshotWrapper()

      context("when the receiver is zero address", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.withdraw(
              await asset1.getAddress(),
              to1e18(10),
              ZeroAddress,
            ),
          )
            .to.be.revertedWithCustomError(multiAssetVault, "InvalidReceiver")
            .withArgs(ZeroAddress)
        })
      })

      context("when the receiver is the same as asset", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.withdraw(
              await asset1.getAddress(),
              to1e18(10),
              await asset1.getAddress(),
            ),
          )
            .to.be.revertedWithCustomError(multiAssetVault, "InvalidReceiver")
            .withArgs(await asset1.getAddress())
        })
      })
    })

    context("when parameters are valid", () => {
      beforeAfterSnapshotWrapper()

      context("when the deposit does not exist", () => {
        it("should revert", async () => {
          await expect(
            multiAssetVault.withdraw(
              await asset1.getAddress(),
              1n,
              await receiver.getAddress(),
            ),
          ).to.be.revertedWithCustomError(multiAssetVault, "DepositNotFound")
        })
      })

      context("when a deposit exists", () => {
        beforeAfterSnapshotWrapper()

        let deposit1: {
          caller: HardhatEthersSigner
          asset: TestERC20
          depositAmount: bigint
          depositOwner: HardhatEthersSigner
          depositId: bigint
        }

        before(async () => {
          deposit1 = {
            caller: depositor1,
            asset: asset1,
            depositAmount: to1e18(10),
            depositOwner: depositor2,
            depositId: 1n,
          }
          await createDepositFor({ ...deposit1, caller: depositor1 })
        })

        context("when the caller is a third party", () => {
          it("should revert", async () => {
            await expect(
              multiAssetVault
                .connect(thirdParty)
                .withdraw(
                  await deposit1.asset.getAddress(),
                  deposit1.depositId,
                  await receiver.getAddress(),
                ),
            ).to.be.revertedWithCustomError(multiAssetVault, "DepositNotFound")
          })
        })

        context("when the caller is the deposit funder", () => {
          it("should revert", async () => {
            await expect(
              multiAssetVault
                .connect(deposit1.caller)
                .withdraw(
                  await deposit1.asset.getAddress(),
                  deposit1.depositId,
                  await receiver.getAddress(),
                ),
            ).to.be.revertedWithCustomError(multiAssetVault, "DepositNotFound")
          })
        })

        context("when the caller is the receiver", () => {
          it("should revert", async () => {
            await expect(
              multiAssetVault
                .connect(receiver)
                .withdraw(
                  await deposit1.asset.getAddress(),
                  deposit1.depositId,
                  await receiver.getAddress(),
                ),
            ).to.be.revertedWithCustomError(multiAssetVault, "DepositNotFound")
          })
        })

        context("when the caller is the deposit owner", () => {
          let callResult: bigint
          let tx: ContractTransactionResponse

          before(async () => {
            callResult = await multiAssetVault
              .connect(deposit1.depositOwner)
              .withdraw.staticCall(
                await deposit1.asset.getAddress(),
                deposit1.depositId,
                await receiver.getAddress(),
              )
            tx = await multiAssetVault
              .connect(deposit1.depositOwner)
              .withdraw(
                await deposit1.asset.getAddress(),
                deposit1.depositId,
                await receiver.getAddress(),
              )
          })

          it("should return the withdrawn amount", () => {
            expect(callResult).to.be.equal(deposit1.depositAmount)
          })

          it("should emit DepositWithdrawn event", async () => {
            await expect(tx)
              .to.emit(multiAssetVault, "DepositWithdrawn")
              .withArgs(
                await deposit1.depositOwner.getAddress(),
                await deposit1.asset.getAddress(),
                deposit1.depositId,
                deposit1.depositAmount,
                await receiver.getAddress(),
              )
          })

          it("should withdraw the deposit from the Mezo Portal", async () => {
            await expect(tx)
              .to.emit(mezoPortal, "WithdrawFully")
              .withArgs(
                await asset1.getAddress(),
                initialMezoDepositCount + deposit1.depositId,
              )
          })

          it("should delete deposit data", async () => {
            const depositData = await multiAssetVault.getDeposit(
              await deposit1.depositOwner.getAddress(),
              await deposit1.asset.getAddress(),
              deposit1.depositId,
            )

            expect(depositData.balance).to.be.equal(0)
            expect(depositData.mezoDepositId).to.be.equal(0)
          })

          it("should transfer the asset to the receiver", async () => {
            await expect(tx).to.changeTokenBalances(
              asset1,
              [mezoPortal, multiAssetVault, receiver],
              [-deposit1.depositAmount, 0, deposit1.depositAmount],
            )
          })

          context("when tries to withdraw the same deposit again", () => {
            it("should revert", async () => {
              await expect(
                multiAssetVault
                  .connect(deposit1.depositOwner)
                  .withdraw(
                    await deposit1.asset.getAddress(),
                    deposit1.depositId,
                    await receiver.getAddress(),
                  ),
              ).to.be.revertedWithCustomError(
                multiAssetVault,
                "DepositNotFound",
              )
            })
          })
        })
      })
    })

    context("when multiple deposits are withdrawn", () => {
      beforeAfterSnapshotWrapper()

      let deposit1: Deposit
      let deposit2: Deposit
      let deposit3: Deposit

      before(async () => {
        deposit1 = {
          caller: depositor1,
          asset: asset1,
          depositAmount: to1e18(10),
          depositOwner: depositor2,
          depositId: 1n,
        }
        await createDepositFor(deposit1)

        deposit2 = {
          caller: depositor2,
          asset: asset2,
          depositAmount: to1e18(11),
          depositOwner: depositor1,
          depositId: 2n,
        }
        await createDepositFor(deposit2)

        deposit3 = {
          caller: depositor1,
          asset: asset1,
          depositAmount: to1e18(12),
          depositOwner: depositor1,
          depositId: 3n,
        }
        await createDepositFor(deposit3)
      })

      it("should withdraw correct deposit 2", async () => {
        await testWithdrawDeposit(deposit2)
      })

      it("should withdraw correct deposit 1", async () => {
        await testWithdrawDeposit(deposit1)
      })

      it("should withdraw correct deposit 3", async () => {
        await testWithdrawDeposit(deposit3)
      })

      async function testWithdrawDeposit({
        asset,
        depositAmount: expectedWithdrawAmount,
        depositOwner,
        depositId,
      }: Deposit & { depositId: bigint; receiver: HardhatEthersSigner }) {
        const callResult = await multiAssetVault
          .connect(depositOwner)
          .withdraw.staticCall(
            await asset.getAddress(),
            depositId,
            await receiver.getAddress(),
          )

        const tx = await multiAssetVault
          .connect(depositOwner)
          .withdraw(
            await asset.getAddress(),
            depositId,
            await receiver.getAddress(),
          )

        expect(callResult, "invalid returned value").to.equal(
          expectedWithdrawAmount,
        )

        await expect(tx, "invalid DepositWithdrawn event")
          .to.emit(multiAssetVault, "DepositWithdrawn")
          .withArgs(
            await depositOwner.getAddress(),
            await asset.getAddress(),
            depositId,
            expectedWithdrawAmount,
            await receiver.getAddress(),
          )

        await expect(tx, "invalid WithdrawFully event")
          .to.emit(mezoPortal, "WithdrawFully")
          .withArgs(
            await asset.getAddress(),
            initialMezoDepositCount + depositId,
          )

        const depositData = await multiAssetVault.getDeposit(
          await depositOwner.getAddress(),
          await asset.getAddress(),
          depositId,
        )

        expect(depositData.balance, "invalid deposit balance").to.be.equal(0)
        expect(
          depositData.mezoDepositId,
          "invalid mezo deposit id",
        ).to.be.equal(0)

        await expect(tx).to.changeTokenBalances(
          asset,
          [mezoPortal, multiAssetVault, receiver],
          [-expectedWithdrawAmount, 0, expectedWithdrawAmount],
        )
      }
    })
  })

  type Deposit = {
    caller: HardhatEthersSigner
    asset: TestERC20
    depositAmount: bigint
    depositOwner: HardhatEthersSigner
  }

  async function createDepositFor({
    caller,
    asset,
    depositAmount,
    depositOwner,
  }: Deposit) {
    await asset.mint(await caller.getAddress(), depositAmount)
    await asset
      .connect(caller)
      .approve(await multiAssetVault.getAddress(), depositAmount)

    const callResult = await multiAssetVault
      .connect(caller)
      .depositFor.staticCall(
        await asset.getAddress(),
        depositAmount,
        await depositOwner.getAddress(),
      )

    const tx = await multiAssetVault
      .connect(caller)
      .depositFor(
        await asset.getAddress(),
        depositAmount,
        await depositOwner.getAddress(),
      )

    return { callResult, tx }
  }
})
