import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { Contract, MaxUint256, ZeroAddress } from "ethers"
import { deployments, ethers } from "hardhat"

import { deployment } from "../helpers/context"

import type {
  StBTC as stBTC,
  TestERC20,
  MezoAllocator,
  BitcoinDepositor,
} from "../../typechain"
import { getDeployedContract } from "../helpers"

async function fixture() {
  const { stbtc, mezoAllocator, bitcoinDepositor, tbtc } = await deployment()

  return {
    stbtc,
    mezoAllocator,
    bitcoinDepositor,
    tbtc,
  }
}

const mainnetContracts = {
  mezoPortal: "0xAB13B8eecf5AA2460841d75da5d5D861fD5B8A39",
  tbtc: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
  bridge: "0x5e4861a80B55f035D899f66772117F00FA0E8e7B",
  tbtcVault: "0x9C070027cdC9dc8F82416B2e5314E11DFb4FE3CD",
}

const mainnetAccounts = {
  treasury: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  governance: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  pauseAdmin: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  maintainer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
}

describe("Deployment", () => {
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let tbtc: TestERC20
  let bitcoinDepositor: BitcoinDepositor

  before(async () => {
    ;({ stbtc, mezoAllocator, bitcoinDepositor, tbtc } =
      await loadFixture(fixture))
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
        expect(await stbtc.asset()).to.be.equal(mainnetContracts.tbtc)
      })

      it("should set treasury", async () => {
        expect(await stbtc.treasury()).to.be.equal(mainnetAccounts.treasury)
      })
    })

    describe("ownable", () => {
      it("should set owner", async () => {
        expect(await stbtc.owner()).to.be.equal(mainnetAccounts.governance)
      })
    })

    describe("pausable", () => {
      it("should set pauseAdmin", async () => {
        expect(await stbtc.pauseAdmin()).to.be.equal(mainnetAccounts.pauseAdmin)
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
    testUpgradeableInitialization(
      "MezoAllocator",
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
    )

    it("should set mezoPortal", async () => {
      expect(await mezoAllocator.mezoPortal()).to.be.equal(
        mainnetContracts.mezoPortal,
      )
    })

    it("should set tbtc", async () => {
      expect(await mezoAllocator.tbtc()).to.be.equal(mainnetContracts.tbtc)
    })

    it("should set stbtc", async () => {
      expect(await mezoAllocator.stbtc()).to.be.equal(await stbtc.getAddress())
    })

    it("should set owner", async () => {
      expect(await mezoAllocator.owner()).to.be.equal(
        mainnetAccounts.governance,
      )
    })

    it("should set maintainer", async () => {
      expect(await mezoAllocator.isMaintainer(mainnetAccounts.maintainer)).to.be
        .true
    })
  })

  describe("BitcoinDepositor", () => {
    testUpgradeableInitialization(
      "BitcoinDepositor",
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
    )

    it("should set bridge", async () => {
      expect(await bitcoinDepositor.bridge()).to.be.equal(
        mainnetContracts.bridge,
      )
    })

    it("should set tbtcVault", async () => {
      expect(await bitcoinDepositor.tbtcVault()).to.be.equal(
        mainnetContracts.tbtcVault,
      )
    })

    it("should set tbtc", async () => {
      expect(await bitcoinDepositor.tbtcToken()).to.be.equal(
        mainnetContracts.tbtc,
      )
    })

    it("should set stbtc", async () => {
      expect(await bitcoinDepositor.stbtc()).to.be.equal(
        await stbtc.getAddress(),
      )
    })

    it("should set owner", async () => {
      expect(await bitcoinDepositor.owner()).to.be.equal(
        mainnetAccounts.governance,
      )
    })
  })

  // TODO: Add tests for BitcoinRedeemer
  describe("BitcoinRedeemer", () => {})
})
