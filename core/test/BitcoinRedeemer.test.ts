import {
  takeSnapshot,
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import {
  AbiCoder,
  ContractTransactionResponse,
  MaxUint256,
  ZeroAddress,
  encodeBytes32String,
} from "ethers"
import { ethers, helpers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import type { SnapshotRestorer } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"

import { to1e18 } from "./utils"

import type {
  StBTC as stBTC,
  Dispatcher,
  BitcoinRedeemer,
  TestTBTC,
} from "../typechain"
import { tbtcRedemptionData } from "./data/tbtc"
import { StbtcEIP712Helper } from "./helpers/eip712"

const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { tbtc, stbtc, dispatcher, bitcoinRedeemer } = await deployment()

  const stbcEIP712Helper = new StbtcEIP712Helper(stbtc)

  const { governance, treasury } = await getNamedSigners()
  const [depositor1, depositor2, thirdParty] = await getUnnamedSigners()

  const amountToMint = to1e18(100000)
  await tbtc.mint(depositor1, amountToMint)
  await tbtc.mint(depositor2, amountToMint)

  return {
    stbtc,
    tbtc,
    bitcoinRedeemer,

    depositor1,
    depositor2,
    dispatcher,
    governance,
    thirdParty,
    treasury,
  }
}

describe("BitcoinRedeemer", () => {
  let stbtc: stBTC
  let tbtc: TestTBTC
  let dispatcher: Dispatcher
  let bitcoinRedeemer: BitcoinRedeemer

  let stbcEIP712Helper: StbtcEIP712Helper

  let governance: HardhatEthersSigner
  let depositor1: HardhatEthersSigner
  let depositor2: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({
      stbtc,
      tbtc,
      bitcoinRedeemer,

      depositor1,
      depositor2,
      dispatcher,
      governance,
      thirdParty,
    } = await loadFixture(fixture))
  })

  describe("receiveApproval", () => {
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
        ).to.be.revertedWithCustomError(bitcoinRedeemer, "UnsupportedToken")
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
            bitcoinRedeemer
              .connect(depositor1)
              .receiveApproval(
                depositor1.address,
                to1e18(1),
                await stbtc.getAddress(),
                encodeBytes32String(""),
              ),
          ).to.be.revertedWithCustomError(bitcoinRedeemer, "EmptyExtraData")
        })
      })

      context("when called with non-empty extraData", () => {
        context("when there is a single redeemer", () => {
          const requestRedemption = async (
            redeemerOutputScript: string,
            amount: BigNumberish,
          ): Promise<ContractTransaction> => {
            const walletPubKeyHash =
              "0x8db50eb52063ea9d98b3eac91489a90f738986f6"
            const mainUtxo = {
              txHash:
                "0x3835ecdee2daa83c9a19b5012104ace55ecab197b5e16489c26d372e475f5d2a",
              txOutputIndex: 0,
              txOutputValue: 10000000000,
            }

            const data = AbiCoder.encode(
              ["address", "bytes20", "bytes32", "uint32", "uint64", "bytes"],
              [
                depositor1.address,
                walletPubKeyHash,
                mainUtxo.txHash,
                mainUtxo.txOutputIndex,
                mainUtxo.txOutputValue,
                redeemerOutputScript,
              ],
            )

            return tbtc
              .connect(depositor1)
              .approveAndCall(await bitcoinRedeemer.getAddress(), amount, data)
          }

          const redeemerOutputScriptP2WPKH =
            "0x160014f4eedc8f40d4b8e30771f792b065ebec0abaddef"
          const redeemerOutputScriptP2WSH =
            "0x220020ef0b4d985752aa5ef6243e4c6f6bebc2a007e7d671ef27d4b1d0db8dcc93bc1c"
          const redeemerOutputScriptP2PKH =
            "0x1976a914f4eedc8f40d4b8e30771f792b065ebec0abaddef88ac"
          const redeemerOutputScriptP2SH =
            "0x17a914f4eedc8f40d4b8e30771f792b065ebec0abaddef87"

          const mintedAmount = to1e18(100)
          const redeemedAmount1 = to1e18(10)
          const redeemedAmount2 = to1e18(20)
          const redeemedAmount3 = to1e18(30)
          const redeemedAmount4 = to1e18(15)
          const totalRedeemedAmount = redeemedAmount1
            .add(redeemedAmount2)
            .add(redeemedAmount3)
            .add(redeemedAmount4)
          const notRedeemedAmount = mintedAmount.sub(totalRedeemedAmount)

          const transactions: ContractTransaction[] = []

          before(async () => {
            await createSnapshot()

            await tbtcVault.connect(account1).mint(mintedAmount)

            transactions.push(
              await requestRedemption(
                account1,
                redeemerOutputScriptP2WPKH,
                redeemedAmount1,
              ),
            )
            transactions.push(
              await requestRedemption(
                account1,
                redeemerOutputScriptP2WSH,
                redeemedAmount2,
              ),
            )
            transactions.push(
              await requestRedemption(
                account1,
                redeemerOutputScriptP2PKH,
                redeemedAmount3,
              ),
            )
            transactions.push(
              await requestRedemption(
                account1,
                redeemerOutputScriptP2SH,
                redeemedAmount4,
              ),
            )
          })

          after(async () => {
            await restoreSnapshot()
          })

          it("should transfer balances to Bridge", async () => {
            expect(await bank.balanceOf(tbtcVault.address)).to.equal(
              notRedeemedAmount.div(constants.satoshiMultiplier),
            )
            expect(await bank.balanceOf(bridge.address)).to.equal(
              totalRedeemedAmount.div(constants.satoshiMultiplier),
            )
          })

          it("should request redemptions in Bridge", async () => {
            const redemptionRequest1 = await bridge.pendingRedemptions(
              buildRedemptionKey(walletPubKeyHash, redeemerOutputScriptP2WPKH),
            )
            expect(redemptionRequest1.redeemer).to.be.equal(account1.address)
            expect(redemptionRequest1.requestedAmount).to.be.equal(
              redeemedAmount1.div(constants.satoshiMultiplier),
            )

            const redemptionRequest2 = await bridge.pendingRedemptions(
              buildRedemptionKey(walletPubKeyHash, redeemerOutputScriptP2WSH),
            )
            expect(redemptionRequest2.redeemer).to.be.equal(account1.address)
            expect(redemptionRequest2.requestedAmount).to.be.equal(
              redeemedAmount2.div(constants.satoshiMultiplier),
            )

            const redemptionRequest3 = await bridge.pendingRedemptions(
              buildRedemptionKey(walletPubKeyHash, redeemerOutputScriptP2PKH),
            )
            expect(redemptionRequest3.redeemer).to.be.equal(account1.address)
            expect(redemptionRequest3.requestedAmount).to.be.equal(
              redeemedAmount3.div(constants.satoshiMultiplier),
            )

            const redemptionRequest4 = await bridge.pendingRedemptions(
              buildRedemptionKey(walletPubKeyHash, redeemerOutputScriptP2SH),
            )
            expect(redemptionRequest4.redeemer).to.be.equal(account1.address)
            expect(redemptionRequest4.requestedAmount).to.be.equal(
              redeemedAmount4.div(constants.satoshiMultiplier),
            )
          })

          it("should burn TBTC", async () => {
            expect(await tbtc.balanceOf(account1.address)).to.equal(
              notRedeemedAmount,
            )
            expect(await tbtc.totalSupply()).to.be.equal(notRedeemedAmount)
          })

          it("should emit Unminted events", async () => {
            await expect(transactions[0])
              .to.emit(tbtcVault, "Unminted")
              .withArgs(account1.address, redeemedAmount1)
            await expect(transactions[1])
              .to.emit(tbtcVault, "Unminted")
              .withArgs(account1.address, redeemedAmount2)
            await expect(transactions[2])
              .to.emit(tbtcVault, "Unminted")
              .withArgs(account1.address, redeemedAmount3)
            await expect(transactions[3])
              .to.emit(tbtcVault, "Unminted")
              .withArgs(account1.address, redeemedAmount4)
          })
        })

        context("when there are multiple redeemers", () => {
          const redeemerOutputScriptP2WPKH =
            "0x160014f4eedc8f40d4b8e30771f792b065ebec0abaddef"
          const redeemerOutputScriptP2WSH =
            "0x220020ef0b4d985752aa5ef6243e4c6f6bebc2a007e7d671ef27d4b1d0db8dcc93bc1c"

          const mintedAmount1 = to1e18(10)
          const mintedAmount2 = to1e18(20)
          const redeemedAmount1 = to1e18(1)
          const redeemedAmount2 = to1e18(2)

          const totalMintedAmount = mintedAmount1.add(mintedAmount2)
          const totalRedeemedAmount = redeemedAmount1.add(redeemedAmount2)
          const totalNotRedeemedAmount =
            totalMintedAmount.sub(totalRedeemedAmount)

          const transactions: ContractTransaction[] = []

          before(async () => {
            await createSnapshot()

            await tbtcVault.connect(account1).mint(mintedAmount1)
            await tbtcVault.connect(account2).mint(mintedAmount2)

            transactions.push(
              await requestRedemption(
                account1,
                redeemerOutputScriptP2WPKH,
                redeemedAmount1,
              ),
            )
            transactions.push(
              await requestRedemption(
                account2,
                redeemerOutputScriptP2WSH,
                redeemedAmount2,
              ),
            )
          })

          after(async () => {
            await restoreSnapshot()
          })

          it("should transfer balances to Bridge", async () => {
            expect(await bank.balanceOf(tbtcVault.address)).to.equal(
              totalNotRedeemedAmount.div(constants.satoshiMultiplier),
            )
            expect(await bank.balanceOf(bridge.address)).to.equal(
              totalRedeemedAmount.div(constants.satoshiMultiplier),
            )
          })

          it("should request redemptions in Bridge", async () => {
            const redemptionRequest1 = await bridge.pendingRedemptions(
              buildRedemptionKey(walletPubKeyHash, redeemerOutputScriptP2WPKH),
            )
            expect(redemptionRequest1.redeemer).to.be.equal(account1.address)
            expect(redemptionRequest1.requestedAmount).to.be.equal(
              redeemedAmount1.div(constants.satoshiMultiplier),
            )

            const redemptionRequest2 = await bridge.pendingRedemptions(
              buildRedemptionKey(walletPubKeyHash, redeemerOutputScriptP2WSH),
            )
            expect(redemptionRequest2.redeemer).to.be.equal(account2.address)
            expect(redemptionRequest2.requestedAmount).to.be.equal(
              redeemedAmount2.div(constants.satoshiMultiplier),
            )
          })

          it("should burn TBTC", async () => {
            expect(await tbtc.balanceOf(account1.address)).to.equal(
              mintedAmount1.sub(redeemedAmount1),
            )
            expect(await tbtc.balanceOf(account2.address)).to.equal(
              mintedAmount2.sub(redeemedAmount2),
            )
            expect(await tbtc.totalSupply()).to.be.equal(totalNotRedeemedAmount)
          })

          it("should emit Unminted events", async () => {
            await expect(transactions[0])
              .to.emit(tbtcVault, "Unminted")
              .withArgs(account1.address, redeemedAmount1)
            await expect(transactions[1])
              .to.emit(tbtcVault, "Unminted")
              .withArgs(account2.address, redeemedAmount2)
          })
        })
      })
    })
    context("when called with an empty extraData", () => {
      const mintedAmount = to1e18(10)
      const unmintedAmount = to1e18(4)
      const notUnmintedAmount = mintedAmount.sub(unmintedAmount) // 10 - 4 = 6

      let tx: ContractTransaction

      before(async () => {
        await createSnapshot()

        await bitcoinRedeemer.connect(account1).mint(mintedAmount)
        tx = await tbtc
          .connect(account1)
          .approveAndCall(bitcoinRedeemer.address, unmintedAmount, [])
      })

      after(async () => {
        await restoreSnapshot()
      })

      it("should transfer balance to the unminter", async () => {
        expect(await bank.balanceOf(bitcoinRedeemer.address)).to.equal(
          toSatoshis(6),
        )
        expect(await bank.balanceOf(account1.address)).to.equal(
          toSatoshis(94), // 100 - 6
        )
      })

      it("should burn TBTC", async () => {
        expect(await tbtc.balanceOf(account1.address)).to.equal(
          notUnmintedAmount,
        )
        expect(await tbtc.totalSupply()).to.be.equal(notUnmintedAmount)
      })

      it("should emit Unminted event", async () => {
        await expect(tx)
          .to.emit(vault, "Unminted")
          .withArgs(account1.address, unmintedAmount)
      })
    })

    context("when amount is not fully convertible to satoshis", () => {
      const mintedAmount = to1e18(20)
      // Amount is 3 Bitcoin in 1e18 precision plus 0.1 satoshi in 1e18 precision
      const unmintedAmount = ethers.BigNumber.from("3000000001000000000")
      const notUnmintedAmount = to1e18(17) // 20 - 3; remainder should be ignored

      let transaction: ContractTransaction

      before(async () => {
        await createSnapshot()

        await bitcoinRedeemer.connect(account1).mint(mintedAmount)
        transaction = await tbtc
          .connect(account1)
          .approveAndCall(bitcoinRedeemer.address, unmintedAmount, [])
      })

      after(async () => {
        await restoreSnapshot()
      })

      // unminting 3 BTC, the remainder is ignored

      it("should transfer balance to the unminter", async () => {
        expect(await bank.balanceOf(bitcoinRedeemer.address)).to.equal(
          toSatoshis(17),
        ) // 20 - 3
        expect(await bank.balanceOf(account1.address)).to.equal(
          toSatoshis(83), // 100 - 17
        )
      })

      it("should burn TBTC", async () => {
        expect(await tbtc.balanceOf(account1.address)).to.equal(
          notUnmintedAmount,
        )
        expect(await tbtc.totalSupply()).to.be.equal(notUnmintedAmount)
      })

      it("should emit Unminted events", async () => {
        await expect(transaction)
          .to.emit(vault, "Unminted")
          .withArgs(account1.address, to1e18(3))
      })
    })
  })
})
