import { ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import {
  SnapshotRestorer,
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { ContractTransactionResponse } from "ethers"
import type { Acre, Dispatcher, TestERC4626, TestERC20 } from "../../typechain"
import { deployment } from "../helpers/context"
import { getNamedSigner, getUnnamedSigner } from "../helpers/signer"
import { to1e18 } from "../utils"

async function fixture() {
  const { tbtc, acre, dispatcher, vault } = await deployment()
  const { governance, maintainer } = await getNamedSigner()
  const [thirdParty] = await getUnnamedSigner()

  return { acre, dispatcher, governance, thirdParty, vault, tbtc, maintainer }
}

describe("Integration Tests - Asset Flows", () => {
  let snapshot: SnapshotRestorer

  let dispatcher: Dispatcher
  let acre: Acre
  let vault: TestERC4626
  let tbtc: TestERC20
  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner
  let maintainer: HardhatEthersSigner

  const tbtcToMintForAcre = to1e18(100000)

  before(async () => {
    ;({ acre, dispatcher, governance, thirdParty, vault, tbtc, maintainer } =
      await loadFixture(fixture))

    await dispatcher.connect(governance).authorizeVault(vault.getAddress())
    await tbtc.mint(acre.getAddress(), tbtcToMintForAcre)
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot()
  })

  afterEach(async () => {
    await snapshot.restore()
  })

  describe("depositToVault", () => {
    const assetsToAllocate = to1e18(100)
    const minSharesOut = to1e18(100)

    context("when caller is not Maintainer", () => {
      it("should revert when depositing to a vault", async () => {
        await expect(
          dispatcher
            .connect(thirdParty)
            .depositToVault(vault.getAddress(), assetsToAllocate, minSharesOut),
        ).to.be.revertedWithCustomError(dispatcher, "NotMaintainer")
      })
    })

    context("when caller is Maintainer", () => {
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

        context("when allocation is successfull", () => {
          let tx: ContractTransactionResponse
          before(async () => {
            tx = await dispatcher
              .connect(maintainer)
              .depositToVault(vaultAddress, assetsToAllocate, minSharesOut)
          })

          it("should be able to deposit to an authorized Vault", async () => {
            expect(await tbtc.balanceOf(vault.getAddress())).to.equal(
              assetsToAllocate,
            )
          })

          it("should be able to receive Vault's shares", async () => {
            expect(await vault.balanceOf(acre.getAddress())).to.equal(
              minSharesOut,
            )
          })

          it("should emit a DepositAllocated event", async () => {
            await expect(tx)
              .to.emit(dispatcher, "DepositAllocated")
              .withArgs(vaultAddress, assetsToAllocate, minSharesOut)
          })
        })

        context("when allocation is not successfull", () => {
          const minShares = to1e18(101)

          it("should emit a MinSharesError event", async () => {
            await expect(
              dispatcher
                .connect(maintainer)
                .depositToVault(vaultAddress, assetsToAllocate, minShares),
            ).to.be.revertedWithCustomError(dispatcher, "MinSharesError")
          })
        })
      })
    })
  })
})
