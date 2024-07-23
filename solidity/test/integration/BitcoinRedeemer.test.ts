import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "../helpers"

import { StBTC as stBTC, BitcoinRedeemer, BridgeStub } from "../../typechain"

import { tbtcRedemptionData } from "../data/tbtc"

const { getNamedSigners, getUnnamedSigners } = helpers.signers
const { impersonateAccount } = helpers.account

async function fixture() {
  const { tbtc, stbtc, bitcoinRedeemer, tbtcBridge } = await deployment()
  const { deployer, governance, maintainer } = await getNamedSigners()
  const [depositor, thirdParty] = await getUnnamedSigners()

  return {
    deployer,
    governance,
    thirdParty,
    depositor,
    maintainer,
    tbtc,
    stbtc,
    bitcoinRedeemer,
    tbtcBridge,
  }
}

describe("BitcoinRedeemer", () => {
  let stbtc: stBTC
  let bitcoinRedeemer: BitcoinRedeemer
  let tbtcBridge: BridgeStub

  let depositor: HardhatEthersSigner

  before(async () => {
    let deployer: HardhatEthersSigner
    ;({ deployer, depositor, stbtc, bitcoinRedeemer, tbtcBridge } =
      await loadFixture(fixture))

    await impersonateAccount(tbtcRedemptionData.redeemer, { from: deployer })
    depositor = await ethers.getSigner(tbtcRedemptionData.redeemer)
  })

  describe("receiveApproval", () => {
    beforeAfterSnapshotWrapper()

    let tx: ContractTransactionResponse

    context("when the deposit is not fully withdrawn", () => {
      beforeAfterSnapshotWrapper()

      const stBtcAmountToRedeem = BigInt(0.01 * 1e18)
      const expectedTbtcAmountToRedeem = 9975062344139650n // 0.01 tBTC * (1 - (25 / (10000 + 25))) = ~0.009975 tBTC

      before(async () => {
        tx = await stbtc
          .connect(depositor)
          .approveAndCall(
            await bitcoinRedeemer.getAddress(),
            stBtcAmountToRedeem,
            tbtcRedemptionData.redemptionData,
          )
      })

      it("should burn stBTC from depositor", async () => {
        await expect(tx).to.changeTokenBalances(
          stbtc,
          [depositor.address],
          [-stBtcAmountToRedeem],
        )
      })

      it("should emit RedemptionRequested event from BitcoinRedeemer", async () => {
        await expect(tx)
          .to.emit(bitcoinRedeemer, "RedemptionRequested")
          .withArgs(
            depositor.address,
            stBtcAmountToRedeem,
            expectedTbtcAmountToRedeem,
          )
      })

      it("should emit RedemptionRequested event from tBTC Bridge", async () => {
        await expect(tx).to.emit(tbtcBridge, "RedemptionRequested")
      })
    })
  })
})
