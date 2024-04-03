import chaiAsPromised from "chai-as-promised"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect, use } from "chai"
import { helpers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"
import {
  TestERC20,
  StBTC,
  BitcoinDepositor,
  BridgeStub,
  TBTCVaultStub,
  BitcoinDepositorV2,
} from "../typechain"
import { to1e18 } from "./utils"

use(chaiAsPromised)

async function fixture() {
  const { tbtc, stbtc, bitcoinDepositor, tbtcBridge, tbtcVault } =
    await deployment()

  return { tbtc, stbtc, bitcoinDepositor, tbtcBridge, tbtcVault }
}

describe("BitcoinDepositor contract upgrade", () => {
  let tbtc: TestERC20
  let tbtcBridge: BridgeStub
  let tbtcVault: TBTCVaultStub
  let stbtc: StBTC
  let bitcoinDepositor: BitcoinDepositor
  let governance: HardhatEthersSigner

  before(async () => {
    ;({ tbtc, stbtc, bitcoinDepositor, tbtcBridge, tbtcVault } =
      await loadFixture(fixture))
    ;({ governance } = await helpers.signers.getNamedSigners())
  })

  context("when upgrading to an invalid contract", () => {
    context("when the new variable was added before the old one", () => {
      beforeAfterSnapshotWrapper()

      it("should throw an error", async () => {
        await expect(
          helpers.upgrades.upgradeProxy(
            "BitcoinDepositor",
            "BitcoinDepositorMisplacedSlot",
            {
              initializerArgs: [
                await tbtcBridge.getAddress(),
                await tbtcVault.getAddress(),
                await tbtc.getAddress(),
                await stbtc.getAddress(),
              ],
              factoryOpts: { signer: governance },
            },
          ),
        ).to.rejectedWith(Error, "Inserted `newVariable`")
      })
    })

    context("when a variable was removed", () => {
      beforeAfterSnapshotWrapper()

      it("should throw an error", async () => {
        await expect(
          helpers.upgrades.upgradeProxy(
            "BitcoinDepositor",
            "BitcoinDepositorMissingSlot",
            {
              initializerArgs: [
                await tbtcBridge.getAddress(),
                await tbtcVault.getAddress(),
                await tbtc.getAddress(),
                await stbtc.getAddress(),
              ],
              factoryOpts: { signer: governance },
            },
          ),
        ).to.be.rejectedWith(Error, "Deleted `queuedStakesBalance`")
      })
    })
  })

  context("when upgrading to a valid contract", () => {
    const newVariable = 1n
    let bitcoinDepositorV2: BitcoinDepositorV2
    let v1InitialParameters: {
      minStakeAmount: bigint
      maxSingleStakeAmount: bigint
      maxTotalAssetsSoftLimit: bigint
      depositorFeeDivisor: bigint
    }

    beforeAfterSnapshotWrapper()

    before(async () => {
      const minStakeAmount = await bitcoinDepositor.minStakeAmount()
      const maxSingleStakeAmount = await bitcoinDepositor.maxSingleStakeAmount()
      const maxTotalAssetsSoftLimit =
        await bitcoinDepositor.maxTotalAssetsSoftLimit()
      const depositorFeeDivisor = await bitcoinDepositor.depositorFeeDivisor()

      v1InitialParameters = {
        minStakeAmount,
        maxSingleStakeAmount,
        maxTotalAssetsSoftLimit,
        depositorFeeDivisor,
      }

      const [upgradedDepositor] = await helpers.upgrades.upgradeProxy(
        "BitcoinDepositor",
        "BitcoinDepositorV2",
        {
          factoryOpts: { signer: governance },
          proxyOpts: {
            call: {
              fn: "initializeV2",
              args: [newVariable],
            },
          },
        },
      )

      bitcoinDepositorV2 = upgradedDepositor as unknown as BitcoinDepositorV2
    })

    it("new instance should have the same address as the old one", async () => {
      expect(await bitcoinDepositorV2.getAddress()).to.equal(
        await bitcoinDepositor.getAddress(),
      )
    })

    describe("contract variables", () => {
      it("should initialize new variable correctly", async () => {
        expect(await bitcoinDepositorV2.newVariable()).to.eq(newVariable)
      })

      it("should keep v1 initial parameters", async () => {
        expect(await bitcoinDepositorV2.bridge()).to.eq(
          await tbtcBridge.getAddress(),
        )
        expect(await bitcoinDepositorV2.tbtcVault()).to.eq(
          await tbtcVault.getAddress(),
        )
        expect(await bitcoinDepositorV2.tbtcToken()).to.eq(
          await tbtc.getAddress(),
        )
        expect(await bitcoinDepositorV2.stbtc()).to.eq(await stbtc.getAddress())

        expect(await bitcoinDepositorV2.minStakeAmount()).to.eq(
          v1InitialParameters.minStakeAmount,
        )
        expect(await bitcoinDepositorV2.maxSingleStakeAmount()).to.eq(
          v1InitialParameters.maxSingleStakeAmount,
        )

        expect(await bitcoinDepositorV2.maxTotalAssetsSoftLimit()).to.eq(
          v1InitialParameters.maxTotalAssetsSoftLimit,
        )
        expect(await bitcoinDepositorV2.depositorFeeDivisor()).to.eq(
          v1InitialParameters.depositorFeeDivisor,
        )
      })
    })

    describe("upgraded `updateMaxSingleStakeAmount` function", () => {
      const newMaxSingleStakeAmount: bigint = to1e18(1000)
      let tx: ContractTransactionResponse

      before(async () => {
        tx = await bitcoinDepositorV2
          .connect(governance)
          .updateMaxSingleStakeAmount(newMaxSingleStakeAmount)
      })

      it("should emit `NewEvent` event", async () => {
        await expect(tx).to.emit(bitcoinDepositorV2, "NewEvent")
      })
    })
  })
})
