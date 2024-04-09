import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ethers, helpers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ContractTransactionResponse } from "ethers"
import { beforeAfterSnapshotWrapper, deployment } from "./helpers"
import {
  TestERC20,
  MezoAllocator,
  MezoAllocatorV2,
  IMezoPortal,
  StBTC,
} from "../typechain"

async function fixture() {
  const { stbtc, tbtc, mezoAllocator, mezoPortal } = await deployment()

  return { stbtc, tbtc, mezoAllocator, mezoPortal }
}

describe("MezoAllocator contract upgrade", () => {
  let mezoPortal: IMezoPortal
  let tbtc: TestERC20
  let stbtc: StBTC
  let mezoAllocator: MezoAllocator
  let governance: HardhatEthersSigner

  before(async () => {
    ;({ stbtc, tbtc, mezoAllocator, mezoPortal } = await loadFixture(fixture))
    ;({ governance } = await helpers.signers.getNamedSigners())
  })

  context("when upgrading to a valid contract", () => {
    let allocatorV2: MezoAllocatorV2
    const newVariable = 1n

    beforeAfterSnapshotWrapper()

    before(async () => {
      const [upgradedAllocator] = await helpers.upgrades.upgradeProxy(
        "MezoAllocator",
        "MezoAllocatorV2",
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

      allocatorV2 = upgradedAllocator as unknown as MezoAllocatorV2
    })

    it("new instance should have the same address as the old one", async () => {
      expect(await allocatorV2.getAddress()).to.equal(
        await mezoAllocator.getAddress(),
      )
    })

    describe("contract variables", () => {
      it("should initialize new variable correctly", async () => {
        expect(await allocatorV2.newVariable()).to.eq(newVariable)
      })

      it("should keep v1 initial parameters", async () => {
        expect(await allocatorV2.mezoPortal()).to.eq(
          await mezoPortal.getAddress(),
        )
        expect(await allocatorV2.tbtc()).to.eq(await tbtc.getAddress())
        expect(await allocatorV2.stbtc()).to.eq(await stbtc.getAddress())
      })
    })

    describe("upgraded `addMaintainer` function", () => {
      let tx: ContractTransactionResponse

      before(async () => {
        const newAddress = await ethers.Wallet.createRandom().getAddress()

        tx = await allocatorV2.connect(governance).addMaintainer(newAddress)
      })

      it("should emit `NewEvent` event", async () => {
        await expect(tx).to.emit(allocatorV2, "NewEvent")
      })
    })
  })
})
