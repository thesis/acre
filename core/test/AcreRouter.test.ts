import { getUnnamedAccounts } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { Address } from "hardhat-deploy/types"
import { expect } from "chai"
import {
  SnapshotRestorer,
  takeSnapshot,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import type { AcreRouter } from "../typechain"
import { deployment } from "./helpers/context"
import { getNamedSigner, getUnnamedSigner } from "./helpers/signer"

describe("AcreRouter", () => {
  let snapshot: SnapshotRestorer

  let acreRouter: AcreRouter
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

    acreRouter = (await deployment()).acreRouter
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot()
  })

  afterEach(async () => {
    await snapshot.restore()
  })

  describe("addVault", () => {
    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          acreRouter.connect(thirdParty).addVault(vault1),
        ).to.be.revertedWithCustomError(
          acreRouter,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when caller is a governance account", () => {
      it("should be able to add vaults", async () => {
        await acreRouter.connect(governance).addVault(vault1)
        await acreRouter.connect(governance).addVault(vault2)
        await acreRouter.connect(governance).addVault(vault3)

        expect(await acreRouter.vaults(0)).to.equal(vault1)
        const isVault1Approved = await acreRouter.vaultsInfo(vault1)
        expect(isVault1Approved).to.equal(true)

        expect(await acreRouter.vaults(1)).to.equal(vault2)
        const isVault2Approved = await acreRouter.vaultsInfo(vault2)
        expect(isVault2Approved).to.equal(true)

        expect(await acreRouter.vaults(2)).to.equal(vault3)
        const isVault3Approved = await acreRouter.vaultsInfo(vault3)
        expect(isVault3Approved).to.equal(true)
      })

      it("should not be able to add the same vault twice", async () => {
        await acreRouter.connect(governance).addVault(vault1)
        await expect(
          acreRouter.connect(governance).addVault(vault1),
        ).to.be.revertedWith("Vault already approved")
      })

      it("should emit an event when adding a vault", async () => {
        await expect(acreRouter.connect(governance).addVault(vault1))
          .to.emit(acreRouter, "VaultAdded")
          .withArgs(vault1)
      })
    })
  })

  describe("removeVault", () => {
    beforeEach(async () => {
      await acreRouter.connect(governance).addVault(vault1)
      await acreRouter.connect(governance).addVault(vault2)
      await acreRouter.connect(governance).addVault(vault3)
    })

    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          acreRouter.connect(thirdParty).removeVault(vault1),
        ).to.be.revertedWithCustomError(
          acreRouter,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    context("when caller is a governance account", () => {
      it("should be able to remove vaults", async () => {
        await acreRouter.connect(governance).removeVault(vault1)

        // Last vault replaced the first vault in the 'vaults' array
        expect(await acreRouter.vaults(0)).to.equal(vault3)
        const isVault1Approved = await acreRouter.vaultsInfo(vault1)
        expect(isVault1Approved).to.equal(false)
        expect(await acreRouter.vaultsLength()).to.equal(2)

        await acreRouter.connect(governance).removeVault(vault2)

        // Last vault (vault2) was removed from the 'vaults' array
        expect(await acreRouter.vaults(0)).to.equal(vault3)
        expect(await acreRouter.vaultsLength()).to.equal(1)
        const isVault2Approved = await acreRouter.vaultsInfo(vault2)
        expect(isVault2Approved).to.equal(false)

        await acreRouter.connect(governance).removeVault(vault3)
        expect(await acreRouter.vaultsLength()).to.equal(0)
        const isVault3Approved = await acreRouter.vaultsInfo(vault3)
        expect(isVault3Approved).to.equal(false)
      })

      it("should not be able to remove a vault that is not approved", async () => {
        await expect(
          acreRouter.connect(governance).removeVault(vault4),
        ).to.be.revertedWith("Not a vault")
      })

      it("should emit an event when removing a vault", async () => {
        await expect(acreRouter.connect(governance).removeVault(vault1))
          .to.emit(acreRouter, "VaultRemoved")
          .withArgs(vault1)
      })
    })
  })
})
