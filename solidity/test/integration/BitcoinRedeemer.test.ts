import { helpers, ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "../helpers"

import {
  StBTC as stBTC,
  TestERC20,
  BitcoinRedeemer,
  BridgeStub,
} from "../../typechain"

import { to1e18 } from "../utils"

import { tbtcRedemptionData } from "../data/tbtc"

const { getNamedSigners, getUnnamedSigners } = helpers.signers
const { impersonateAccount } = helpers.account

async function fixture() {
  const { tbtc, stbtc, bitcoinRedeemer, tbtcBridge } = await deployment()
  const { governance, maintainer } = await getNamedSigners()
  const [depositor, thirdParty] = await getUnnamedSigners()

  return {
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
  let tbtc: TestERC20
  let stbtc: stBTC
  let bitcoinRedeemer: BitcoinRedeemer
  let tbtcBridge: BridgeStub

  let depositor: HardhatEthersSigner

  before(async () => {
    ;({ depositor, tbtc, stbtc, bitcoinRedeemer, tbtcBridge } =
      await loadFixture(fixture))

    await impersonateAccount(tbtcRedemptionData.redeemer)
    depositor = await ethers.getSigner(tbtcRedemptionData.redeemer)
  })

  describe("receiveApproval", () => {
    beforeAfterSnapshotWrapper()

    let tx: ContractTransactionResponse

    before(async () => {
      await tbtc
        .connect(depositor)
        .approve(await stbtc.getAddress(), to1e18(10))
      await stbtc.connect(depositor).deposit(to1e18(10), depositor)
    })

    context("when the deposit is not fully withdrawn", () => {
      beforeAfterSnapshotWrapper()

      const stBtcAmountToRedeem = to1e18(5)
      const expectedTbtcAmountToRedeem = to1e18(5)

      before(async () => {
        tx = await stbtc
          .connect(depositor)
          .approveAndCall(
            await bitcoinRedeemer.getAddress(),
            stBtcAmountToRedeem,
            tbtcRedemptionData.redemptionData,
          )
      })

      it("should burn 5 stBTC from depositor", async () => {
        await expect(tx).to.changeTokenBalances(
          stbtc,
          [depositor.address],
          [-stBtcAmountToRedeem],
        )
      })

      it("should emit RedemptionRequested event", async () => {
        await expect(tx)
          .to.emit(bitcoinRedeemer, "RedemptionRequested")
          .withArgs(
            depositor.address,
            stBtcAmountToRedeem,
            expectedTbtcAmountToRedeem,
          )
      })

      it("should emit RedemptionRequested event", async () => {
        await expect(tx).to.emit(tbtcBridge, "RedemptionRequested")
      })
    })
  })
})
