import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import {
  loadFixture,
  setBalance,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse } from "ethers"

import { IMezoPortal, AcreMultiAssetVault, IERC20 } from "../../typechain"

import { to1e18 } from "../utils"
import { expectedMainnetAddresses, integrationTestFixture } from "./helpers"

const { impersonateAccount } = helpers.account

const testData = {
  SolvBtc: {
    assetAddress: expectedMainnetAddresses.solvBtc,
    assetHolderAddress: "0x19b5cc75846BF6286d599ec116536a333C4C2c14",
    depositAmount: to1e18(100),
  },
  SolvBtcBbn: {
    assetAddress: expectedMainnetAddresses.solvBtcBbn,
    assetHolderAddress: "0x8bc93498b861fd98277c3b51d240e7E56E48F23c",
    depositAmount: to1e18(1000),
  },
}

describe("AcreMultiAssetVault", () => {
  let multiAssetVault: AcreMultiAssetVault
  let mezoPortal: IMezoPortal

  before(async () => {
    ;({ multiAssetVault, mezoPortal } = await loadFixture(
      integrationTestFixture,
    ))
  })

  const testRoundTrip = ({
    assetAddress,
    assetHolderAddress,
    depositAmount,
  }: {
    assetAddress: string
    assetHolderAddress: string
    depositAmount: bigint
  }) =>
    // eslint-disable-next-line func-names
    function () {
      describe("round trip", () => {
        let asset: IERC20

        let expectedAcreDepositId: bigint
        let expectedMezoDepositId: bigint

        let depositor: HardhatEthersSigner
        let depositOwner: HardhatEthersSigner
        let receiver: HardhatEthersSigner

        before(async () => {
          asset = await ethers.getContractAt("IERC20", assetAddress)

          await impersonateAccount(assetHolderAddress)
          await setBalance(assetHolderAddress, to1e18(1))
          depositor = await ethers.getSigner(assetHolderAddress)

          expectedAcreDepositId = (await multiAssetVault.depositCount()) + 1n
          expectedMezoDepositId = (await mezoPortal.depositCount()) + 1n

          depositOwner = await newWallet()
          receiver = await newWallet()
        })

        describe("deposit", () => {
          let tx: ContractTransactionResponse

          before(async () => {
            await asset
              .connect(depositor)
              .approve(await multiAssetVault.getAddress(), depositAmount)

            tx = await multiAssetVault
              .connect(depositor)
              .depositFor(
                await asset.getAddress(),
                depositAmount,
                await depositOwner.getAddress(),
              )
          })

          it("should emit a DepositCreated event", async () => {
            await expect(tx)
              .to.emit(multiAssetVault, "DepositCreated")
              .withArgs(
                await depositOwner.getAddress(),
                await asset.getAddress(),
                expectedAcreDepositId,
                depositAmount,
              )
          })

          it("should transfer the asset to the Mezo Portal", async () => {
            await expect(tx).to.changeTokenBalances(
              asset,
              [depositor, multiAssetVault, mezoPortal],
              [-depositAmount, 0, depositAmount],
            )
          })

          it("should store deposit data", async () => {
            const depositData = await multiAssetVault.getDeposit(
              await depositOwner.getAddress(),
              await asset.getAddress(),
              expectedAcreDepositId,
            )

            expect(depositData.balance, "invalid balance").to.equal(
              depositAmount,
            )
            expect(
              depositData.mezoDepositId,
              "invalid mezo deposit id",
            ).to.equal(expectedMezoDepositId)
          })
        })

        describe("withdraw", () => {
          let tx: ContractTransactionResponse

          before(async () => {
            tx = await multiAssetVault
              .connect(depositOwner)
              .withdraw(
                await asset.getAddress(),
                expectedAcreDepositId,
                await receiver.getAddress(),
              )
          })

          it("should emit a DepositWithdrawn event", async () => {
            await expect(tx)
              .to.emit(multiAssetVault, "DepositWithdrawn")
              .withArgs(
                await depositOwner.getAddress(),
                await asset.getAddress(),
                expectedAcreDepositId,
                depositAmount,
                await receiver.getAddress(),
              )
          })

          it("should transfer the asset to the receiver", async () => {
            await expect(tx).to.changeTokenBalances(
              asset,
              [mezoPortal, multiAssetVault, receiver],
              [-depositAmount, 0, depositAmount],
            )
          })

          it("should delete deposit data", async () => {
            const depositData = await multiAssetVault.getDeposit(
              await receiver.getAddress(),
              await asset.getAddress(),
              expectedAcreDepositId,
            )

            expect(depositData.balance, "invalid balance").to.equal(0)
            expect(
              depositData.mezoDepositId,
              "invalid mezo deposit id",
            ).to.equal(0)
          })

          it("should not be able to withdraw again", async () => {
            await expect(
              multiAssetVault
                .connect(depositOwner)
                .withdraw(
                  await asset.getAddress(),
                  expectedAcreDepositId,
                  await receiver.getAddress(),
                ),
            ).to.be.revertedWithCustomError(multiAssetVault, "DepositNotFound")
          })
        })
      })
    }

  describe("SolvBTC", testRoundTrip(testData.SolvBtc))

  describe("SolvBTC.BBN", testRoundTrip(testData.SolvBtcBbn))
})

async function newWallet() {
  const newAddress = ethers.Wallet.createRandom().address
  await setBalance(newAddress, to1e18(1))
  return ethers.getImpersonatedSigner(newAddress)
}
