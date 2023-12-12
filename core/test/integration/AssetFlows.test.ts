import { ethers } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import {
  SnapshotRestorer,
  takeSnapshot,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import type { Acre, Dispatcher, TestERC4626, TestERC20 } from "../../typechain"
import { deployment } from "../helpers/context"
import { getNamedSigner, getUnnamedSigner } from "../helpers/signer"
import { to1e18 } from "../utils"

async function fixture() {
  const { tbtc, acre, dispatcher, vault } = await deployment()
  const { governance } = await getNamedSigner()
  const [thirdParty] = await getUnnamedSigner()

  return { acre, dispatcher, governance, thirdParty, vault, tbtc }
}

describe("Integration Test - Asset Flows", () => {
  let snapshot: SnapshotRestorer

  let dispatcher: Dispatcher
  let acre: Acre
  let vault: TestERC4626
  let tbtc: TestERC20
  let governance: HardhatEthersSigner
  let thirdParty: HardhatEthersSigner

  before(async () => {
    ;({ acre, dispatcher, governance, thirdParty, vault, tbtc } =
      await loadFixture(fixture))

    await dispatcher.connect(governance).authorizeVault(vault.getAddress())
    await tbtc.mint(acre.getAddress(), to1e18(100000))
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot()
  })

  afterEach(async () => {
    await snapshot.restore()
  })

  describe("depositToVault", () => {
    const tbtcToDeposit = to1e18(100)
    const shares = to1e18(100)

    context("when caller is not Acre (stBTC)", () => {
      it("should revert when depositing to a vault", async () => {
        await expect(
          dispatcher
            .connect(thirdParty)
            .depositToVault(vault.getAddress(), tbtcToDeposit, shares),
        )
          .to.be.revertedWithCustomError(dispatcher, "CallerUnauthorized")
          .withArgs("Acre only")
      })
    })

    context("when caller is Acre (stBTC)", () => {
      it("should revert when vault is unauthorized", async () => {
        const randomAddress = await ethers.Wallet.createRandom().getAddress()
        await expect(
          acre.depositToVault(randomAddress, tbtcToDeposit, shares),
        ).to.be.revertedWithCustomError(dispatcher, "VaultUnauthorized")
      })

      it("should be able to deposit to an authorized vault", async () => {
        await acre.depositToVault(vault.getAddress(), tbtcToDeposit, shares)

        expect(await tbtc.balanceOf(vault.getAddress())).to.equal(tbtcToDeposit)
      })

      it("should be able to receive vault's shares", async () => {
        await acre.depositToVault(vault.getAddress(), tbtcToDeposit, shares)

        expect(await vault.balanceOf(acre.getAddress())).to.equal(shares)
      })

      // TODO: add more tests
    })
  })

  describe("redeemFromVault", () => {
    // TODO: add tests
  })
})
