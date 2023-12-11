import { getUnnamedAccounts } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { Address } from "hardhat-deploy/types"
import { expect } from "chai"
import {
  SnapshotRestorer,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import type { Dispatcher } from "../typechain"
import { deployment } from "./helpers/context"
import { getNamedSigner, getUnnamedSigner } from "./helpers/signer"

describe("Dispatcher", () => {
  let snapshot: SnapshotRestorer

  let dispatcher: Dispatcher
  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let vault1: Address
  let vault2: Address
  let vault3: Address
  let vault4: Address

  before(async () => {
    const accounts = await getUnnamedAccounts()
    ;[vault1, vault2, vault3, vault4] = accounts

    governance = (await getNamedSigner()).governance
    ;[thirdParty] = await getUnnamedSigner()

    dispatcher = (await deployment()).dispatcher
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
          dispatcher.connect(thirdParty).authorizeVault(vault1),
        ).to.be.revertedWithCustomError(
          dispatcher,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when caller is a governance account", () => {
      it("should be able to add vaults", async () => {
        await dispatcher.connect(governance).authorizeVault(vault1)
        await dispatcher.connect(governance).authorizeVault(vault2)
        await dispatcher.connect(governance).authorizeVault(vault3)

        expect(await dispatcher.vaults(0)).to.equal(vault1)
        const isVault1Authorized = await dispatcher.vaultsInfo(vault1)
        expect(isVault1Authorized).to.equal(true)

        expect(await dispatcher.vaults(1)).to.equal(vault2)
        const isVault2Authorized = await dispatcher.vaultsInfo(vault2)
        expect(isVault2Authorized).to.equal(true)

        expect(await dispatcher.vaults(2)).to.equal(vault3)
        const isVault3Authorized = await dispatcher.vaultsInfo(vault3)
        expect(isVault3Authorized).to.equal(true)
      })

      it("should not be able to add the same vault twice", async () => {
        await dispatcher.connect(governance).authorizeVault(vault1)
        await expect(
          dispatcher.connect(governance).authorizeVault(vault1),
        ).to.be.revertedWithCustomError(dispatcher, "VaultAlreadyAuthorized")
      })

      it("should emit an event when adding a vault", async () => {
        await expect(dispatcher.connect(governance).authorizeVault(vault1))
          .to.emit(dispatcher, "VaultAuthorized")
          .withArgs(vault1)
      })
    })
  })

  describe("deauthorizeVault", () => {
    beforeEach(async () => {
      await dispatcher.connect(governance).authorizeVault(vault1)
      await dispatcher.connect(governance).authorizeVault(vault2)
      await dispatcher.connect(governance).authorizeVault(vault3)
    })

    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          dispatcher.connect(thirdParty).deauthorizeVault(vault1),
        ).to.be.revertedWithCustomError(
          dispatcher,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when caller is a governance account", () => {
      it("should be able to remove vaults", async () => {
        await dispatcher.connect(governance).deauthorizeVault(vault1)

        // Last vault replaced the first vault in the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vault3)
        const isVault1Authorized = await dispatcher.vaultsInfo(vault1)
        expect(isVault1Authorized).to.equal(false)
        expect((await dispatcher.getVaults()).length).to.equal(2)

        await dispatcher.connect(governance).deauthorizeVault(vault2)

        // Last vault (vault2) was removed from the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vault3)
        expect((await dispatcher.getVaults()).length).to.equal(1)
        const isVault2Authorized = await dispatcher.vaultsInfo(vault2)
        expect(isVault2Authorized).to.equal(false)

        await dispatcher.connect(governance).deauthorizeVault(vault3)
        expect((await dispatcher.getVaults()).length).to.equal(0)
        const isVault3Authorized = await dispatcher.vaultsInfo(vault3)
        expect(isVault3Authorized).to.equal(false)
      })

      it("should not be able to remove a vault that is not authorized", async () => {
        await expect(
          dispatcher.connect(governance).deauthorizeVault(vault4),
        ).to.be.revertedWithCustomError(dispatcher, "VaultUnauthorized")
      })

      it("should emit an event when removing a vault", async () => {
        await expect(dispatcher.connect(governance).deauthorizeVault(vault1))
          .to.emit(dispatcher, "VaultDeauthorized")
          .withArgs(vault1)
      })
    })
  })
})
