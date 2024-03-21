import { ethers, helpers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

import { ContractTransactionResponse, ZeroAddress } from "ethers"
import {
  beforeAfterEachSnapshotWrapper,
  beforeAfterSnapshotWrapper,
  deployment,
} from "./helpers"

import {
  Dispatcher,
  TestERC4626,
  StBTC as stBTC,
  TestERC20,
} from "../typechain"

import { to1e18 } from "./utils"

const { getNamedSigners, getUnnamedSigners } = helpers.signers

async function fixture() {
  const { tbtc, stbtc, dispatcher, vault } = await deployment()
  const { governance, maintainer } = await getNamedSigners()
  const [thirdParty] = await getUnnamedSigners()

  return { dispatcher, governance, thirdParty, maintainer, vault, tbtc, stbtc }
}

describe.skip("Dispatcher", () => {
  let dispatcher: Dispatcher
  let vault: TestERC4626
  let tbtc: TestERC20
  let stbtc: stBTC

  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let maintainer: HardhatEthersSigner
  let vaultAddress1: string
  let vaultAddress2: string
  let vaultAddress3: string
  let vaultAddress4: string

  before(async () => {
    ;({ dispatcher, governance, thirdParty, maintainer, vault, tbtc, stbtc } =
      await loadFixture(fixture))

    vaultAddress1 = await ethers.Wallet.createRandom().getAddress()
    vaultAddress2 = await ethers.Wallet.createRandom().getAddress()
    vaultAddress3 = await ethers.Wallet.createRandom().getAddress()
    vaultAddress4 = await ethers.Wallet.createRandom().getAddress()
  })

  describe("authorizeVault", () => {
    beforeAfterSnapshotWrapper()

    context("when caller is not a governance account", () => {
      beforeAfterSnapshotWrapper()

      it("should revert when adding a vault", async () => {
        await expect(
          dispatcher.connect(thirdParty).authorizeVault(vaultAddress1),
        )
          .to.be.revertedWithCustomError(
            dispatcher,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is a governance account", () => {
      beforeAfterSnapshotWrapper()

      let tx: ContractTransactionResponse

      before(async () => {
        tx = await dispatcher.connect(governance).authorizeVault(vaultAddress1)
        await dispatcher.connect(governance).authorizeVault(vaultAddress2)
        await dispatcher.connect(governance).authorizeVault(vaultAddress3)
      })

      it("should authorize vaults", async () => {
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress1)
        expect(await dispatcher.vaultsInfo(vaultAddress1)).to.be.equal(true)

        expect(await dispatcher.vaults(1)).to.equal(vaultAddress2)
        expect(await dispatcher.vaultsInfo(vaultAddress2)).to.be.equal(true)

        expect(await dispatcher.vaults(2)).to.equal(vaultAddress3)
        expect(await dispatcher.vaultsInfo(vaultAddress3)).to.be.equal(true)
      })

      it("should not authorize the same vault twice", async () => {
        await expect(
          dispatcher.connect(governance).authorizeVault(vaultAddress1),
        ).to.be.revertedWithCustomError(dispatcher, "VaultAlreadyAuthorized")
      })

      it("should emit an event when adding a vault", async () => {
        await expect(tx)
          .to.emit(dispatcher, "VaultAuthorized")
          .withArgs(vaultAddress1)
      })
    })
  })

  describe("deauthorizeVault", () => {
    beforeAfterSnapshotWrapper()

    before(async () => {
      await dispatcher.connect(governance).authorizeVault(vaultAddress1)
      await dispatcher.connect(governance).authorizeVault(vaultAddress2)
      await dispatcher.connect(governance).authorizeVault(vaultAddress3)
    })

    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          dispatcher.connect(thirdParty).deauthorizeVault(vaultAddress1),
        )
          .to.be.revertedWithCustomError(
            dispatcher,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is a governance account", () => {
      beforeAfterEachSnapshotWrapper()

      it("should deauthorize vaults", async () => {
        await dispatcher.connect(governance).deauthorizeVault(vaultAddress1)

        // Last vault replaced the first vault in the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress3)
        expect(await dispatcher.vaultsInfo(vaultAddress1)).to.be.equal(false)
        expect((await dispatcher.getVaults()).length).to.equal(2)

        await dispatcher.connect(governance).deauthorizeVault(vaultAddress2)

        // Last vault (vaultAddress2) was removed from the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress3)
        expect((await dispatcher.getVaults()).length).to.equal(1)
        expect(await dispatcher.vaultsInfo(vaultAddress2)).to.be.equal(false)

        await dispatcher.connect(governance).deauthorizeVault(vaultAddress3)
        expect((await dispatcher.getVaults()).length).to.equal(0)
        expect(await dispatcher.vaultsInfo(vaultAddress3)).to.be.equal(false)
      })

      it("should deauthorize a vault and authorize it again", async () => {
        await dispatcher.connect(governance).deauthorizeVault(vaultAddress1)
        expect(await dispatcher.vaultsInfo(vaultAddress1)).to.be.equal(false)

        await dispatcher.connect(governance).authorizeVault(vaultAddress1)
        expect(await dispatcher.vaultsInfo(vaultAddress1)).to.be.equal(true)
      })

      it("should not deauthorize a vault that is not authorized", async () => {
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

  describe("depositToVault", () => {
    beforeAfterSnapshotWrapper()

    const assetsToAllocate = to1e18(100)
    const minSharesOut = to1e18(100)

    before(async () => {
      await dispatcher.connect(governance).authorizeVault(vault.getAddress())
      await tbtc.mint(await stbtc.getAddress(), to1e18(100000))
    })

    context("when caller is not maintainer", () => {
      beforeAfterSnapshotWrapper()

      it("should revert when depositing to a vault", async () => {
        await expect(
          dispatcher
            .connect(thirdParty)
            .depositToVault(
              await vault.getAddress(),
              assetsToAllocate,
              minSharesOut,
            ),
        ).to.be.revertedWithCustomError(dispatcher, "NotMaintainer")
      })
    })

    context("when caller is maintainer", () => {
      context("when vault is not authorized", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          const randomAddress = await ethers.Wallet.createRandom().getAddress()
          await expect(
            dispatcher
              .connect(maintainer)
              .depositToVault(randomAddress, assetsToAllocate, minSharesOut),
          ).to.be.revertedWithCustomError(dispatcher, "VaultUnauthorized")
        })
      })

      context("when the vault is authorized", () => {
        let vaultAddress: string

        before(async () => {
          vaultAddress = await vault.getAddress()
        })

        context("when allocation is successful", () => {
          beforeAfterSnapshotWrapper()

          let tx: ContractTransactionResponse

          before(async () => {
            tx = await dispatcher
              .connect(maintainer)
              .depositToVault(vaultAddress, assetsToAllocate, minSharesOut)
          })

          it("should deposit tBTC to a vault", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [stbtc, vault],
              [-assetsToAllocate, assetsToAllocate],
            )
          })

          it("should mint vault's shares for stBTC contract", async () => {
            await expect(tx).to.changeTokenBalances(
              vault,
              [stbtc],
              [minSharesOut],
            )
          })

          it("should emit a DepositAllocated event", async () => {
            await expect(tx)
              .to.emit(dispatcher, "DepositAllocated")
              .withArgs(vaultAddress, assetsToAllocate, minSharesOut)
          })
        })

        context(
          "when the expected returned shares are less than the actual returned shares",
          () => {
            beforeAfterSnapshotWrapper()

            const sharesOut = assetsToAllocate
            const minShares = to1e18(101)

            it("should emit a MinSharesError event", async () => {
              await expect(
                dispatcher
                  .connect(maintainer)
                  .depositToVault(vaultAddress, assetsToAllocate, minShares),
              )
                .to.be.revertedWithCustomError(dispatcher, "MinSharesError")
                .withArgs(vaultAddress, sharesOut, minShares)
            })
          },
        )
      })
    })
  })

  describe("updateMaintainer", () => {
    beforeAfterSnapshotWrapper()

    let newMaintainer: string

    before(async () => {
      newMaintainer = await ethers.Wallet.createRandom().getAddress()
    })

    context("when caller is not an owner", () => {
      beforeAfterSnapshotWrapper()

      it("should revert", async () => {
        await expect(
          dispatcher.connect(thirdParty).updateMaintainer(newMaintainer),
        )
          .to.be.revertedWithCustomError(
            dispatcher,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is an owner", () => {
      context("when maintainer is a zero address", () => {
        beforeAfterSnapshotWrapper()

        it("should revert", async () => {
          await expect(
            dispatcher.connect(governance).updateMaintainer(ZeroAddress),
          ).to.be.revertedWithCustomError(dispatcher, "ZeroAddress")
        })
      })

      context("when maintainer is not a zero address", () => {
        beforeAfterSnapshotWrapper()

        let tx: ContractTransactionResponse

        before(async () => {
          tx = await dispatcher
            .connect(governance)
            .updateMaintainer(newMaintainer)
        })

        it("should update the maintainer", async () => {
          expect(await dispatcher.maintainer()).to.be.equal(newMaintainer)
        })

        it("should emit an event when updating the maintainer", async () => {
          await expect(tx)
            .to.emit(dispatcher, "MaintainerUpdated")
            .withArgs(newMaintainer)
        })
      })
    })
  })
})
