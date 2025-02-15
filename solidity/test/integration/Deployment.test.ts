import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { Contract, MaxUint256, ZeroAddress } from "ethers"
import { deployments, ethers, upgrades } from "hardhat"

import type {
  StBTC as stBTC,
  TestERC20,
  MezoAllocator,
  BitcoinDepositor,
  BitcoinRedeemer,
  AcreMultiAssetVault,
  IMezoPortal,
  ProxyAdmin,
} from "../../typechain"
import { getDeployedContract } from "../helpers"

import { expectedMainnetAddresses, integrationTestFixture } from "./helpers"
import { to1e18 } from "../utils"

describe("Deployment", () => {
  let stbtc: stBTC
  let mezoAllocator: MezoAllocator
  let tbtc: TestERC20
  let bitcoinDepositor: BitcoinDepositor
  let bitcoinRedeemer: BitcoinRedeemer
  let multiAssetVault: AcreMultiAssetVault
  let mezoPortal: IMezoPortal

  before(async () => {
    ;({
      stbtc,
      mezoAllocator,
      bitcoinDepositor,
      bitcoinRedeemer,
      multiAssetVault,
      tbtc,
      mezoPortal,
    } = await loadFixture(integrationTestFixture))
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

    it("should set the governance as the proxy admin owner", async () => {
      const proxy: Contract = await getDeployedContract(contractName)

      const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(
        await proxy.getAddress(),
      )

      const proxyAdmin: ProxyAdmin = await ethers.getContractAt(
        "ProxyAdmin",
        proxyAdminAddress,
      )

      expect(await proxyAdmin.owner()).to.be.equal(
        expectedMainnetAddresses.governance,
      )
    })
  }

  describe("stBTC", () => {
    testUpgradeableInitialization("stBTC", ZeroAddress, ZeroAddress)

    it("should get contract deployed at address", async () => {
      expect(await stbtc.getAddress()).to.be.equal(
        expectedMainnetAddresses.stbtc,
      )
    })

    describe("initializer", () => {
      it("should set asset", async () => {
        expect(await stbtc.asset()).to.be.equal(expectedMainnetAddresses.tbtc)
      })

      it("should set treasury", async () => {
        expect(await stbtc.treasury()).to.be.equal(
          expectedMainnetAddresses.treasury,
        )
      })

      it("should enable non-fungible withdrawals", async () => {
        expect(await stbtc.nonFungibleWithdrawalsEnabled()).to.be.true
      })
    })

    describe("ownable", () => {
      it("should set owner", async () => {
        expect(await stbtc.owner()).to.be.equal(
          expectedMainnetAddresses.governance,
        )
      })
    })

    describe("pausable", () => {
      it("should set pauseAdmin", async () => {
        expect(await stbtc.pauseAdmin()).to.be.equal(
          expectedMainnetAddresses.pauseAdmin,
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

    describe("updateDebtAllowance", () => {
      it("should set value", async () => {
        expect(
          await stbtc.allowedDebt(await mezoPortal.getAddress()),
        ).to.be.equal(to1e18(1000))
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

    it("should get contract deployed at address", async () => {
      expect(await mezoAllocator.getAddress()).to.be.equal(
        expectedMainnetAddresses.mezoAllocator,
      )
    })

    it("should set mezoPortal", async () => {
      expect(await mezoAllocator.mezoPortal()).to.be.equal(
        expectedMainnetAddresses.mezoPortal,
      )
    })

    it("should set tbtc", async () => {
      expect(await mezoAllocator.tbtc()).to.be.equal(
        expectedMainnetAddresses.tbtc,
      )
    })

    it("should set stbtc", async () => {
      expect(await mezoAllocator.stbtc()).to.be.equal(await stbtc.getAddress())
    })

    it("should set owner", async () => {
      expect(await mezoAllocator.owner()).to.be.equal(
        expectedMainnetAddresses.governance,
      )
    })

    it("should set maintainer", async () => {
      expect(
        await mezoAllocator.isMaintainer(expectedMainnetAddresses.maintainer),
      ).to.be.true
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

    it("should get contract deployed at address", async () => {
      expect(await bitcoinDepositor.getAddress()).to.be.equal(
        expectedMainnetAddresses.bitcoinDepositor,
      )
    })

    it("should set bridge", async () => {
      expect(await bitcoinDepositor.bridge()).to.be.equal(
        expectedMainnetAddresses.bridge,
      )
    })

    it("should set tbtcVault", async () => {
      expect(await bitcoinDepositor.tbtcVault()).to.be.equal(
        expectedMainnetAddresses.tbtcVault,
      )
    })

    it("should set tbtc", async () => {
      expect(await bitcoinDepositor.tbtcToken()).to.be.equal(
        expectedMainnetAddresses.tbtc,
      )
    })

    it("should set stbtc", async () => {
      expect(await bitcoinDepositor.stbtc()).to.be.equal(
        await stbtc.getAddress(),
      )
    })

    it("should set owner", async () => {
      expect(await bitcoinDepositor.owner()).to.be.equal(
        expectedMainnetAddresses.governance,
      )
    })
  })

  describe("BitcoinRedeemer", () => {
    testUpgradeableInitialization(
      "BitcoinRedeemer",
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
    )

    it("should get contract deployed at address", async () => {
      expect(await bitcoinRedeemer.getAddress()).to.be.equal(
        expectedMainnetAddresses.bitcoinRedeemer,
      )
    })

    it("should set tbtcVault", async () => {
      expect(await bitcoinRedeemer.tbtcVault()).to.be.equal(
        expectedMainnetAddresses.tbtcVault,
      )
    })

    it("should set tbtc", async () => {
      expect(await bitcoinRedeemer.tbtcToken()).to.be.equal(
        expectedMainnetAddresses.tbtc,
      )
    })

    it("should set stbtc", async () => {
      expect(await bitcoinRedeemer.stbtc()).to.be.equal(
        await stbtc.getAddress(),
      )
    })

    it("should set owner", async () => {
      expect(await bitcoinDepositor.owner()).to.be.equal(
        expectedMainnetAddresses.governance,
      )
    })
  })

  describe("AcreMultiAssetVault", () => {
    testUpgradeableInitialization(
      "AcreMultiAssetVault",
      ZeroAddress,
      ZeroAddress,
      [ZeroAddress],
    )

    it("should get contract deployed at address", async () => {
      expect(await multiAssetVault.getAddress()).to.be.equal(
        expectedMainnetAddresses.multiAssetVault,
      )
    })

    it("should set mezoPortal", async () => {
      expect(await multiAssetVault.mezoPortal()).to.be.equal(
        expectedMainnetAddresses.mezoPortal,
      )
    })

    it("should set supportedAssets", async () => {
      const expectedSupportedAssets = [
        expectedMainnetAddresses.solvBtc,
        expectedMainnetAddresses.solvBtcBbn,
      ]

      for (let i = 0; i < expectedSupportedAssets.length; i += 1) {
        expect(
          // eslint-disable-next-line no-await-in-loop
          await multiAssetVault.supportedAssets(expectedSupportedAssets[i]),
          `asset ${i}/${expectedSupportedAssets.length} is not supported: ${expectedSupportedAssets[i]}`,
        ).to.be.true
      }
    })

    it("should set owner", async () => {
      expect(await multiAssetVault.owner()).to.be.equal(
        expectedMainnetAddresses.governance,
      )
    })
  })
})
