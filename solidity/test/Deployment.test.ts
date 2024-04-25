import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { Contract, MaxUint256, ZeroAddress } from "ethers"
import { helpers, deployments, ethers } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { deployment } from "./helpers/context"

import type {
  StBTC as stBTC,
  TestERC20,
  MezoAllocator,
  IMezoPortal,
  BitcoinDepositor,
  IBridge,
  ITBTCVault,
} from "../typechain"
import { getDeployedContract } from "./helpers"

const { getNamedSigners } = helpers.signers

async function fixture() {
  const {
    tbtc,
    stbtc,
    mezoAllocator,
    mezoPortal,
    bitcoinDepositor,
    tbtcBridge,
    tbtcVault,
  } = await deployment()
  const { governance, maintainer, treasury, pauseAdmin } =
    await getNamedSigners()

  return {
    stbtc,
    mezoAllocator,
    tbtc,
    mezoPortal,
    bitcoinDepositor,
    tbtcBridge,
    tbtcVault,
    governance,
    maintainer,
    treasury,
    pauseAdmin,
  }
}

describe("Deployment", () => {
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let tbtc: TestERC20
  let mezoPortal: IMezoPortal
  let bitcoinDepositor: BitcoinDepositor
  let tbtcBridge: IBridge
  let tbtcVault: ITBTCVault
  let maintainer: HardhatEthersSigner
  let treasury: HardhatEthersSigner
  let governance: HardhatEthersSigner
  let pauseAdmin: HardhatEthersSigner

  before(async () => {
    ;({
      stbtc,
      mezoAllocator,
      tbtc,
      mezoPortal,
      bitcoinDepositor,
      tbtcBridge,
      tbtcVault,
      maintainer,
      treasury,
      governance,
      pauseAdmin,
    } = await loadFixture(fixture))
  })

  function testUpgradeableInitialization(
    contractName: string,
    ...initArgs: unknown[]
  ) {
    it("should disable implementation initializer", async () => {
      const implementationAddress = (await deployments.get(contractName))
        .implementation!

      const implementationContract = await ethers.getContractAt(
        contractName,
        implementationAddress,
      )

      await expect(
        implementationContract.initialize(...initArgs),
      ).to.be.revertedWithCustomError(
        implementationContract,
        "InvalidInitialization",
      )
    })

    it("should disable proxy initializer", async () => {
      const proxy: Contract = await getDeployedContract(contractName)

      await expect(proxy.initialize(...initArgs)).to.be.revertedWithCustomError(
        proxy,
        "InvalidInitialization",
      )
    })
  }

  describe("stBTC", () => {
    testUpgradeableInitialization("stBTC", ZeroAddress, ZeroAddress)

    describe("initializer", () => {
      it("should set asset", async () => {
        expect(await stbtc.asset()).to.be.equal(await tbtc.getAddress())
      })

      it("should set treasury", async () => {
        expect(await stbtc.treasury()).to.be.equal(await treasury.getAddress())
      })
    })

    describe("ownable", () => {
      it("should set owner", async () => {
        expect(await stbtc.owner()).to.be.equal(await governance.getAddress())
      })
    })

    describe("pausable", () => {
      it("should set pauseAdmin", async () => {
        expect(await stbtc.pauseAdmin()).to.be.equal(
          await pauseAdmin.getAddress(),
        )
      })
    })

    describe("updateDispatcher", () => {
      it("should set dispatcher", async () => {
        expect(await stbtc.dispatcher()).to.be.equal(
          await mezoAllocator.getAddress(),
        )
      })

      it("should approve max amount for the dispatcher", async () => {
        const allowance = await tbtc.allowance(
          await stbtc.getAddress(),
          await stbtc.dispatcher(),
        )

        expect(allowance).to.be.equal(MaxUint256)
      })
    })
  })

  describe("MezoAllocator", () => {
    testUpgradeableInitialization("MezoAllocator", ZeroAddress, ZeroAddress)

    it("should set mezoPortal", async () => {
      expect(await mezoAllocator.mezoPortal()).to.be.equal(
        await mezoPortal.getAddress(),
      )
    })

    it("should set tbtc", async () => {
      expect(await mezoAllocator.tbtc()).to.be.equal(await tbtc.getAddress())
    })

    it("should set stbtc", async () => {
      expect(await mezoAllocator.stbtc()).to.be.equal(await stbtc.getAddress())
    })

    it("should set owner", async () => {
      expect(await mezoAllocator.owner()).to.be.equal(
        await governance.getAddress(),
      )
    })

    it("should set maintainer", async () => {
      expect(await mezoAllocator.isMaintainer(maintainer.address)).to.be.true
    })
  })

  describe("BitcoinDepositor", () => {
    testUpgradeableInitialization(
      "AcreBitcoinDepositor",
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
    )

    it("should set bridge", async () => {
      expect(await bitcoinDepositor.bridge()).to.be.equal(
        await tbtcBridge.getAddress(),
      )
    })

    it("should set tbtcVault", async () => {
      expect(await bitcoinDepositor.tbtcVault()).to.be.equal(
        await tbtcVault.getAddress(),
      )
    })

    it("should set tbtc", async () => {
      expect(await bitcoinDepositor.tbtcToken()).to.be.equal(
        await tbtc.getAddress(),
      )
    })

    it("should set stbtc", async () => {
      expect(await bitcoinDepositor.stbtc()).to.be.equal(
        await stbtc.getAddress(),
      )
    })

    it("should set owner", async () => {
      expect(await bitcoinDepositor.owner()).to.be.equal(
        await governance.getAddress(),
      )
    })
  })

  // TODO: Add tests for BitcoinRedeemer
  describe("BitcoinRedeemer", () => {})
})
