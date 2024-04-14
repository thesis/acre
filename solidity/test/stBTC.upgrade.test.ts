import chaiAsPromised from "chai-as-promised"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect, use } from "chai"
import { helpers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"
import { TestERC20, StBTCV2, StBTC } from "../typechain"

use(chaiAsPromised)

async function fixture() {
  const { tbtc, stbtc } = await deployment()

  return { tbtc, stbtc }
}

describe("stBTC contract upgrade", () => {
  let tbtc: TestERC20
  let tbtcAddress: string
  let stbtc: StBTC
  let treasury: HardhatEthersSigner
  let governance: HardhatEthersSigner

  before(async () => {
    ;({ tbtc, stbtc } = await loadFixture(fixture))
    tbtcAddress = await tbtc.getAddress()
    ;({ treasury, governance } = await helpers.signers.getNamedSigners())
  })

  context("when upgrading to a valid contract", () => {
    let stbtcV2: StBTCV2
    let v1MinimumDepositAmount: bigint
    const newVariable = 1n

    beforeAfterSnapshotWrapper()

    before(async () => {
      v1MinimumDepositAmount = await stbtc.minimumDepositAmount()

      const [upgradedStBTC] = await helpers.upgrades.upgradeProxy(
        "stBTC",
        "stBTCV2",
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

      stbtcV2 = upgradedStBTC as unknown as StBTCV2
    })

    it("new instance should have the same address as the old one", async () => {
      expect(await stbtcV2.getAddress()).to.equal(await stbtc.getAddress())
    })

    describe("contract variables", () => {
      it("should initialize new variable correctly", async () => {
        expect(await stbtcV2.newVariable()).to.eq(newVariable)
      })

      it("should keep v1 initial parameters", async () => {
        expect(await stbtcV2.asset()).to.eq(tbtcAddress)
        expect(await stbtcV2.name()).to.eq("Acre Staked Bitcoin")
        expect(await stbtcV2.symbol()).to.eq("stBTC")
        expect(await stbtcV2.treasury()).to.eq(treasury.address)
        expect(await stbtcV2.minimumDepositAmount()).to.eq(
          v1MinimumDepositAmount,
        )
      })
    })

    describe("upgraded `deposit` function", () => {
      let amountToDeposit: bigint
      let depositOwner: HardhatEthersSigner
      let tx: ContractTransactionResponse

      before(async () => {
        ;[depositOwner] = await helpers.signers.getUnnamedSigners()
        amountToDeposit = v1MinimumDepositAmount + 1n

        await tbtc.mint(depositOwner, amountToDeposit)

        await tbtc
          .connect(depositOwner)
          .approve(await stbtcV2.getAddress(), amountToDeposit)

        tx = await stbtcV2
          .connect(depositOwner)
          .deposit(amountToDeposit, depositOwner)
      })

      it("should emit `NewEvent` event", async () => {
        await expect(tx).to.emit(stbtcV2, "NewEvent")
      })
    })
  })
})
