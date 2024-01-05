import { ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import {
  SnapshotRestorer,
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { ZeroAddress } from "ethers"
import type { Dispatcher, TestERC4626, Acre, TestERC20 } from "../typechain"
import { deployment } from "./helpers/context"
import { getNamedSigner, getUnnamedSigner } from "./helpers/signer"
import { to1e18 } from "./utils"

async function fixture() {
  const { tbtc, acre, dispatcher, vault } = await deployment()
  const { governance, maintainer } = await getNamedSigner()
  const [thirdParty] = await getUnnamedSigner()

  return { dispatcher, governance, thirdParty, maintainer, vault, tbtc, acre }
}

describe("Dispatcher", () => {
  let snapshot: SnapshotRestorer

  const vaultsMaxWeight = 10000 // 100%

  let dispatcher: Dispatcher
  let vault: TestERC4626
  let tbtc: TestERC20
  let acre: Acre

  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let maintainer: HardhatEthersSigner
  let vaultAddress1: string
  let vaultWeight1: number
  let vaultAddress2: string
  let vaultWeight2: number
  let vaultAddress3: string
  let vaultWeight3: number
  let vaultAddress4: string
  let vaultWeight4: number

  before(async () => {
    ;({ dispatcher, governance, thirdParty, maintainer, vault, tbtc, acre } =
      await loadFixture(fixture))

    vaultAddress1 = await ethers.Wallet.createRandom().getAddress()
    vaultWeight1 = 1000 // 10%
    vaultAddress2 = await ethers.Wallet.createRandom().getAddress()
    vaultWeight2 = 3000 // 30%
    vaultAddress3 = await ethers.Wallet.createRandom().getAddress()
    vaultWeight3 = 4000 // 40%
    vaultAddress4 = await ethers.Wallet.createRandom().getAddress()
    vaultWeight4 = 2001 // 20.01%
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot()
  })

  afterEach(async () => {
    await snapshot.restore()
  })

  describe("dispatcher params", () => {
    it("should validate vaultsMaxWeight", async () => {
      expect(await dispatcher.vaultsMaxWeight()).to.be.equal(vaultsMaxWeight)
    })
  })

  describe("authorizeVault", () => {
    context("when caller is not a governance account", () => {
      it("should revert when adding a vault", async () => {
        await expect(
          dispatcher
            .connect(thirdParty)
            .authorizeVault(vaultAddress1, vaultWeight1),
        )
          .to.be.revertedWithCustomError(
            dispatcher,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is a governance account", () => {
      let tx: ContractTransactionResponse

      beforeEach(async () => {
        tx = await dispatcher
          .connect(governance)
          .authorizeVault(vaultAddress1, vaultWeight1)
        await dispatcher
          .connect(governance)
          .authorizeVault(vaultAddress2, vaultWeight2)
        await dispatcher
          .connect(governance)
          .authorizeVault(vaultAddress3, vaultWeight3)
      })

      it("should authorize vaults", async () => {
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress1)
        const vaultInfo1 = await dispatcher.vaultsInfo(vaultAddress1)
        expect(vaultInfo1.authorized).to.be.equal(true)

        expect(await dispatcher.vaults(1)).to.equal(vaultAddress2)
        const vaultInfo2 = await dispatcher.vaultsInfo(vaultAddress2)
        expect(vaultInfo2.authorized).to.be.equal(true)

        expect(await dispatcher.vaults(2)).to.equal(vaultAddress3)
        const vaultInfo3 = await dispatcher.vaultsInfo(vaultAddress3)
        expect(vaultInfo3.authorized).to.be.equal(true)
      })

      it("should set vaults weights", async () => {
        const vaultsInfo1 = await dispatcher.vaultsInfo(vaultAddress1)
        expect(vaultsInfo1.weight).to.be.equal(vaultWeight1)

        const vaultsInfo2 = await dispatcher.vaultsInfo(vaultAddress2)
        expect(vaultsInfo2.weight).to.be.equal(vaultWeight2)

        const vaultsInfo3 = await dispatcher.vaultsInfo(vaultAddress3)
        expect(vaultsInfo3.weight).to.be.equal(vaultWeight3)
      })

      it("should revert when vaults weights are greater than vaultsMaxWeight", async () => {
        await expect(
          dispatcher
            .connect(governance)
            .authorizeVault(vaultAddress4, vaultWeight4),
        ).to.be.revertedWithCustomError(
          dispatcher,
          "VaultWeightsExceedTotalWeight",
        )
      })

      it("should revert when vault is zero address", async () => {
        await expect(
          dispatcher
            .connect(governance)
            .authorizeVault(ZeroAddress, vaultWeight1),
        ).to.be.revertedWithCustomError(dispatcher, "ZeroAddress")
      })

      it("should revert when a vault weight is 0", async () => {
        await expect(
          dispatcher.connect(governance).authorizeVault(vaultAddress4, 0),
        ).to.be.revertedWithCustomError(dispatcher, "VaultWeightZero")
      })

      it("should not authorize the same vault twice", async () => {
        await expect(
          dispatcher
            .connect(governance)
            .authorizeVault(vaultAddress1, vaultWeight1),
        ).to.be.revertedWithCustomError(dispatcher, "VaultAlreadyAuthorized")
      })

      it("should emit an event when adding a vault", async () => {
        await expect(tx)
          .to.emit(dispatcher, "VaultAuthorized")
          .withArgs(vaultAddress1, vaultWeight1)
      })
    })
  })

  describe("deauthorizeVault", () => {
    beforeEach(async () => {
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress1, vaultWeight1)
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress2, vaultWeight2)
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress3, vaultWeight3)
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
      it("should deauthorize vaults", async () => {
        await dispatcher.connect(governance).deauthorizeVault(vaultAddress1)

        // Last vault replaced the first vault in the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress3)
        const vaultsInfo1 = await dispatcher.vaultsInfo(vaultAddress1)
        expect(vaultsInfo1.authorized).to.be.equal(false)
        expect(vaultsInfo1.weight).to.be.equal(0)
        expect((await dispatcher.getVaults()).length).to.equal(2)

        await dispatcher.connect(governance).deauthorizeVault(vaultAddress2)

        // Last vault (vaultAddress2) was removed from the 'vaults' array
        expect(await dispatcher.vaults(0)).to.equal(vaultAddress3)
        expect((await dispatcher.getVaults()).length).to.equal(1)
        const vaultsInfo2 = await dispatcher.vaultsInfo(vaultAddress2)
        expect(vaultsInfo2.weight).to.be.equal(0)
        expect(vaultsInfo2.authorized).to.be.equal(false)

        await dispatcher.connect(governance).deauthorizeVault(vaultAddress3)
        expect((await dispatcher.getVaults()).length).to.equal(0)
        const vaultsInfo3 = await dispatcher.vaultsInfo(vaultAddress3)
        expect(vaultsInfo3.weight).to.be.equal(0)
        expect(vaultsInfo3.authorized).to.be.equal(false)
      })

      it("should deauthorize a vault and authorize it again", async () => {
        await dispatcher.connect(governance).deauthorizeVault(vaultAddress1)
        let vaultsInfo1 = await dispatcher.vaultsInfo(vaultAddress1)
        expect(vaultsInfo1.authorized).to.be.equal(false)

        await dispatcher
          .connect(governance)
          .authorizeVault(vaultAddress1, vaultWeight1)
        vaultsInfo1 = await dispatcher.vaultsInfo(vaultAddress1)
        expect(vaultsInfo1.authorized).to.be.equal(true)
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

  describe("updateVaultWeight", () => {
    beforeEach(async () => {
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress1, vaultWeight1)
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress2, vaultWeight2)
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress3, vaultWeight3)
    })

    context("when caller is not a governance account", () => {
      it("should revert when updating a vault weight", async () => {
        await expect(
          dispatcher
            .connect(thirdParty)
            .updateVaultWeights([vaultAddress1], [vaultWeight1]),
        )
          .to.be.revertedWithCustomError(
            dispatcher,
            "OwnableUnauthorizedAccount",
          )
          .withArgs(thirdParty.address)
      })
    })

    context("when caller is a governance account", () => {
      context(
        "when there are more addresses to update than their weights",
        () => {
          it("should revert", async () => {
            const vaultsToSet = [vaultAddress1, vaultAddress2]
            const weightsToSet = [vaultWeight1]
            await expect(
              dispatcher
                .connect(governance)
                .updateVaultWeights(vaultsToSet, weightsToSet),
            ).to.be.revertedWithCustomError(dispatcher, "VaultWeightsMismatch")
          })
        },
      )

      context(
        "when there are less addresses to update than their weights",
        () => {
          it("should revert", async () => {
            const vaultsToSet = [vaultAddress1]
            const weightsToSet = [vaultWeight1, vaultWeight2]
            await expect(
              dispatcher
                .connect(governance)
                .updateVaultWeights(vaultsToSet, weightsToSet),
            ).to.be.revertedWithCustomError(dispatcher, "VaultWeightsMismatch")
          })
        },
      )

      context("when vault is not authorized", () => {
        it("should revert", async () => {
          await expect(
            dispatcher
              .connect(governance)
              .updateVaultWeights([vaultAddress4], [vaultWeight4]),
          ).to.be.revertedWithCustomError(dispatcher, "VaultUnauthorized")
        })
      })

      context("when vault's weight is 0", () => {
        it("should revert", async () => {
          await expect(
            dispatcher
              .connect(governance)
              .updateVaultWeights([vaultAddress1], [0]),
          ).to.be.revertedWithCustomError(dispatcher, "VaultWeightZero")
        })
      })

      context("when weights update are successful", () => {
        let tx: ContractTransactionResponse
        let newWeight1: number
        let newWeight2: number
        let newWeight3: number

        beforeEach(async () => {
          newWeight1 = vaultWeight1 + 1
          newWeight2 = vaultWeight2 + 2
          newWeight3 = vaultWeight2 + 3
          tx = await dispatcher
            .connect(governance)
            .updateVaultWeights(
              [vaultAddress1, vaultAddress2, vaultAddress3],
              [newWeight1, newWeight2, newWeight3],
            )
        })

        it("should update vault weights", async () => {
          const vaultInfo = await dispatcher.vaultsInfo(vaultAddress1)
          expect(vaultInfo.weight).to.be.equal(newWeight1)

          const vaultInfo2 = await dispatcher.vaultsInfo(vaultAddress2)
          expect(vaultInfo2.weight).to.be.equal(newWeight2)

          const vaultInfo3 = await dispatcher.vaultsInfo(vaultAddress3)
          expect(vaultInfo3.weight).to.be.equal(newWeight3)
        })

        it("should emit VaultWeightUpdated events when updating vaults weight", async () => {
          await expect(tx)
            .to.emit(dispatcher, "VaultWeightUpdated")
            .withArgs(vaultAddress1, newWeight1, vaultWeight1)

          await expect(tx)
            .to.emit(dispatcher, "VaultWeightUpdated")
            .withArgs(vaultAddress2, newWeight2, vaultWeight2)

          await expect(tx)
            .to.emit(dispatcher, "VaultWeightUpdated")
            .withArgs(vaultAddress3, newWeight3, vaultWeight3)
        })
      })

      context("when weights update exceed vaults max weight", () => {
        it("should revert", async () => {
          const currentTotalWeight = await dispatcher.getVaultsTotalWeight()
          const diff = BigInt(vaultsMaxWeight) - BigInt(currentTotalWeight)
          const newWeight1 = vaultWeight1 + Number(diff) + 1

          await expect(
            dispatcher
              .connect(governance)
              .updateVaultWeights([vaultAddress1], [Number(newWeight1)]),
          ).to.be.revertedWithCustomError(
            dispatcher,
            "VaultWeightsExceedTotalWeight",
          )
        })
      })
    })
  })

  describe("getVaultsTotalWeight", () => {
    it("should return the sum of vaults weights", async () => {
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress1, vaultWeight1)
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress2, vaultWeight2)
      await dispatcher
        .connect(governance)
        .authorizeVault(vaultAddress3, vaultWeight3)

      expect(await dispatcher.getVaultsTotalWeight()).to.be.equal(
        vaultWeight1 + vaultWeight2 + vaultWeight3,
      )
    })
  })

  // TODO: revisit once the allocation is calculated based on the vaults weights
  describe("depositToVault", () => {
    const assetsToAllocate = to1e18(100)
    const minSharesOut = to1e18(100)

    before(async () => {
      await dispatcher.connect(governance).authorizeVault(vault.getAddress(), 1)
      await tbtc.mint(await acre.getAddress(), to1e18(100000))
    })

    context("when caller is not maintainer", () => {
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
          let tx: ContractTransactionResponse

          before(async () => {
            tx = await dispatcher
              .connect(maintainer)
              .depositToVault(vaultAddress, assetsToAllocate, minSharesOut)
          })

          it("should deposit tBTC to a vault", async () => {
            await expect(tx).to.changeTokenBalances(
              tbtc,
              [acre, vault],
              [-assetsToAllocate, assetsToAllocate],
            )
          })

          it("should mint vault's shares for Acre contract", async () => {
            await expect(tx).to.changeTokenBalances(
              vault,
              [acre],
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
    let newMaintainer: string

    before(async () => {
      newMaintainer = await ethers.Wallet.createRandom().getAddress()
    })

    context("when caller is not an owner", () => {
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
        it("should revert", async () => {
          await expect(
            dispatcher.connect(governance).updateMaintainer(ZeroAddress),
          ).to.be.revertedWithCustomError(dispatcher, "ZeroAddress")
        })
      })

      context("when maintainer is not a zero address", () => {
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
