import { ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import {
  SnapshotRestorer,
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import type { Dispatcher } from "../typechain"
import { deployment } from "./helpers/context"
import { getNamedSigner, getUnnamedSigner } from "./helpers/signer"

async function fixture() {
  const { dispatcher } = await deployment()
  const { governance } = await getNamedSigner()
  const [thirdParty] = await getUnnamedSigner()

  return { dispatcher, governance, thirdParty }
}

describe("Dispatcher", () => {
  let snapshot: SnapshotRestorer

  let dispatcher: Dispatcher
  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let vaultAddress1: string
  let vaultAddress2: string
  let vaultAddress3: string
  let vaultAddress4: string

  before(async () => {
    ;({ dispatcher, governance, thirdParty } = await loadFixture(fixture))

    vaultAddress1 = await ethers.Wallet.createRandom().getAddress()
    vaultAddress2 = await ethers.Wallet.createRandom().getAddress()
    vaultAddress3 = await ethers.Wallet.createRandom().getAddress()
    vaultAddress4 = await ethers.Wallet.createRandom().getAddress()
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot()
  })

  afterEach(async () => {
    await snapshot.restore()
  })

  describe("authorizeVault", () => {
    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          dispatcher.connect(thirdParty).authorizeVault(vaultAddress1),
        ).to.be.revertedWithCustomError(
          dispatcher,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when caller is a governance account", () => {
      it("should be able to add vaults", async () => {
        await dispatcher.connect(governance).authorizeVault(vaultAddress1)
        await dispatcher.connect(governance).authorizeVault(vaultAddress2)
        await dispatcher.connect(governance).authorizeVault(vaultAddress3)

        expect(await dispatcher.vaults(0)).to.equal(vaultAddress1)
        const isVaultAddress1Authorized =
          await dispatcher.vaultsInfo(vaultAddress1)
        expect(isVaultAddress1Authorized).to.equal(true)

        expect(await dispatcher.vaults(1)).to.equal(vaultAddress2)
        const isVaultAddress2Authorized =
          await dispatcher.vaultsInfo(vaultAddress2)
        expect(isVaultAddress2Authorized).to.equal(true)

        expect(await dispatcher.vaults(2)).to.equal(vaultAddress3)
        const isVaultAddress3Authorized =
          await dispatcher.vaultsInfo(vaultAddress3)
        expect(isVaultAddress3Authorized).to.equal(true)
      })

      it("should not be able to add the same vault twice", async () => {
        await dispatcher.connect(governance).authorizeVault(vaultAddress1)
        await expect(
          dispatcher.connect(governance).authorizeVault(vaultAddress1),
        ).to.be.revertedWithCustomError(dispatcher, "VaultAlreadyAuthorized")
      })

      it("should emit an event when adding a vault", async () => {
        await expect(
          dispatcher.connect(governance).authorizeVault(vaultAddress1),
        )
          .to.emit(dispatcher, "VaultAuthorized")
          .withArgs(vaultAddress1)
      })
    })
  })

  describe("deauthorizeVault", () => {
    beforeEach(async () => {
      await dispatcher.connect(governance).authorizeVault(vaultAddress1)
      await dispatcher.connect(governance).authorizeVault(vaultAddress2)
      await dispatcher.connect(governance).authorizeVault(vaultAddress3)
    })

    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          dispatcher.connect(thirdParty).deauthorizeVault(vaultAddress1),
        ).to.be.revertedWithCustomError(
          dispatcher,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when caller is a governance account", () => {
      it("should be able to remove vaults", async () => {
        await dispatcher.connect(governance).deauthorizeVault(vaultAddress1)

        // Last vault replaced the first vault in the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress3)
        const isVaultAddress1Authorized =
          await dispatcher.vaultsInfo(vaultAddress1)
        expect(isVaultAddress1Authorized).to.equal(false)
        expect((await dispatcher.getVaults()).length).to.equal(2)

        await dispatcher.connect(governance).deauthorizeVault(vaultAddress2)

        // Last vault (vaultAddress2) was removed from the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress3)
        expect((await dispatcher.getVaults()).length).to.equal(1)
        const isVaultAddress2Authorized =
          await dispatcher.vaultsInfo(vaultAddress2)
        expect(isVaultAddress2Authorized).to.equal(false)

        await dispatcher.connect(governance).deauthorizeVault(vaultAddress3)
        expect((await dispatcher.getVaults()).length).to.equal(0)
        const isVaultAddress3Authorized =
          await dispatcher.vaultsInfo(vaultAddress3)
        expect(isVaultAddress3Authorized).to.equal(false)
      })

      it("should not be able to remove a vault that is not authorized", async () => {
        await expect(
          dispatcher.connect(governance).deauthorizeVault(vaultAddress4),
        ).to.be.revertedWithCustomError(dispatcher, "VaultUnauthorized")
      })

      it("should emit an event when removing a vault", async () => {
        await expect(
          dispatcher.connect(governance).deauthorizeVault(vaultAddress1),
        )
          .to.emit(dispatcher, "VaultDeauthorized")
          .withArgs(vaultAddress1)
      })
    })
  })
})
