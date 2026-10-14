import { expect } from "chai"
import { ethers, upgrades } from "hardhat"
import type { Signer } from "ethers"

import type {
  AcreBTC,
  IERC20,
  ProxyAdmin,
  WithdrawalQueue,
} from "../../../typechain"
import type { Bridge } from "../../../typechain/external"
import { rescueRedemptionFixture } from "./data/rescue-redemption"

import {
  ACRE,
  EXTERNAL,
  ROLES,
  TEST_HOLDER,
  atDeployment,
  atExternal,
  forkingConfigured,
  impersonate,
  resetToMainnetFork,
} from "./helpers"

/**
 * Mainnet fork rehearsal of the rescue of WithdrawalQueue request 1, as in
 * docs/WithdrawalQueueRequest1Rescue.md. Request 1 stored the hash of its
 * redeemer output script without the length byte the tBTC Bridge requires, so
 * it can never be finalized. The steps run in order and share state: upgrade
 * the queue, repair the hash, finalize the request.
 *
 * The Bridge only accepts a Live wallet with its current main UTXO. If you
 * change the fork block, run `scripts/find-redemption-wallet.ts` again and
 * update `data/rescue-redemption.ts`.
 *
 * Run with:
 *
 *   MAINNET_RPC_URL=<rpc url> npx hardhat test \
 *     test/integration/midas-exit/StuckRedemptionRescue.test.ts --network hardhat
 */
describe("WithdrawalQueue request 1 rescue - mainnet fork", () => {
  const REQUEST_ID = 1n

  /** What request 1 saved on chain. */
  const REQUEST = {
    redeemer: TEST_HOLDER,
    tbtcAmount: 14947630922693266n,
    exitFeeInTbtc: 37369077306734n,
  }

  /**
   * `TBTCVault.SATOSHI_MULTIPLIER`. tBTC has 18 decimals but Bitcoin only has
   * 8, so the vault unmints whole satoshi and leaves the remainder behind.
   */
  const SATOSHI_MULTIPLIER = 10_000_000_000n

  /** The script request 1 saved the hash of: the fixture without its length byte. */
  const legacyScript = ethers.dataSlice(
    rescueRedemptionFixture.redeemerOutputScript,
    1,
  )

  /** The Bridge's key for our redemption on the fixture wallet. */
  const redemptionKey = ethers.solidityPackedKeccak256(
    ["bytes32", "bytes20"],
    [
      ethers.keccak256(rescueRedemptionFixture.redeemerOutputScript),
      rescueRedemptionFixture.walletPubKeyHash,
    ],
  )

  const redemptionData = (redeemerOutputScript: string): string =>
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "bytes20", "bytes32", "uint32", "uint64", "bytes"],
      [
        REQUEST.redeemer,
        rescueRedemptionFixture.walletPubKeyHash,
        rescueRedemptionFixture.mainUtxo.txHash,
        rescueRedemptionFixture.mainUtxo.txOutputIndex,
        rescueRedemptionFixture.mainUtxo.txOutputValue,
        redeemerOutputScript,
      ],
    )

  let governance: Signer
  let maintainer: Signer

  let acreBtc: AcreBTC
  let withdrawalQueue: WithdrawalQueue
  let tbtc: IERC20
  let bridge: Bridge

  let treasury: string
  /** The queue's tBTC balance before anything is touched. */
  let queueBalanceBefore: bigint

  before(async function () {
    if (!forkingConfigured()) {
      // eslint-disable-next-line no-console
      console.warn(
        "\n  SKIPPED: set MAINNET_RPC_URL to an archive endpoint to run the " +
          "WithdrawalQueue request 1 rescue fork test.\n",
      )
      this.skip()
    }

    await resetToMainnetFork(rescueRedemptionFixture.validAtBlock)

    governance = await impersonate(ROLES.governance)
    maintainer = await impersonate(ROLES.maintainer)

    acreBtc = await atDeployment<AcreBTC>("acreBTC")
    // The deployed ABI, so steps 1 and 2 test the code that is really on
    // mainnet. Step 3 switches to the new ABI after the upgrade.
    withdrawalQueue = await atDeployment<WithdrawalQueue>("WithdrawalQueue")
    tbtc = await atExternal<IERC20>("TBTC")
    bridge = await atExternal<Bridge>("Bridge")

    treasury = await acreBtc.treasury()
    queueBalanceBefore = await tbtc.balanceOf(ACRE.withdrawalQueue)
  })

  describe("step 1 - pre-flight", () => {
    it("runs after acreBTC was detached from the queue", async () => {
      expect(await acreBtc.withdrawalQueue()).to.equal(ethers.ZeroAddress)
    })

    it("has the owner and the maintainer we expect", async () => {
      expect(await withdrawalQueue.owner()).to.equal(ROLES.governance)
      expect(await withdrawalQueue.pendingOwner()).to.equal(ethers.ZeroAddress)
      expect(
        await withdrawalQueue.isMaintainer(ROLES.maintainer),
        "finalizeRedeemAndBridge needs the maintainer",
      ).to.equal(true)
    })

    it("still points at the tBTC token owner", async () => {
      const tbtcToken = await ethers.getContractAt("ITBTCToken", EXTERNAL.tbtc)
      expect(await withdrawalQueue.tbtcVault()).to.equal(EXTERNAL.tbtcVault)
      expect(
        await tbtcToken.owner(),
        "finalizeRedeemAndBridge reverts UnexpectedTbtcTokenOwner without this",
      ).to.equal(EXTERNAL.tbtcVault)
    })

    it("has request 1 pending", async () => {
      const request = await withdrawalQueue.redemAndBridgeRequests(REQUEST_ID)
      expect(request.redeemer).to.equal(REQUEST.redeemer)
      expect(request.tbtcAmount).to.equal(REQUEST.tbtcAmount)
      expect(request.exitFeeInTbtc).to.equal(REQUEST.exitFeeInTbtc)
      expect(request.completedAt).to.equal(0n)
      expect(request.redeemerOutputScriptHash).to.equal(
        rescueRedemptionFixture.legacyRedeemerOutputScriptHash,
      )
    })

    it("holds the tBTC of request 1", () => {
      expect(queueBalanceBefore).to.be.greaterThanOrEqual(
        REQUEST.tbtcAmount + REQUEST.exitFeeInTbtc,
      )
    })

    it("names a Live wallet with its current main UTXO", async () => {
      const wallet = await bridge.wallets(
        rescueRedemptionFixture.walletPubKeyHash,
      )
      expect(wallet.state, "wallet is not Live").to.equal(1n)
      expect(
        wallet.mainUtxoHash,
        "main UTXO is stale - run scripts/find-redemption-wallet.ts again",
      ).to.equal(
        ethers.solidityPackedKeccak256(
          ["bytes32", "uint32", "uint64"],
          [
            rescueRedemptionFixture.mainUtxo.txHash,
            rescueRedemptionFixture.mainUtxo.txOutputIndex,
            rescueRedemptionFixture.mainUtxo.txOutputValue,
          ],
        ),
      )
    })

    it("has no redemption pending to this script on the wallet", async () => {
      expect(
        (await bridge.pendingRedemptions(redemptionKey)).requestedAt,
      ).to.equal(0n)
    })
  })

  describe("step 2 - request 1 cannot be finalized today", () => {
    it("is rejected by the Bridge with the script that matches the saved hash", async () => {
      await expect(
        withdrawalQueue
          .connect(maintainer)
          .finalizeRedeemAndBridge(REQUEST_ID, redemptionData(legacyScript)),
      ).to.be.revertedWith("Redeemer output script must be a standard type")
    })

    it("is rejected by the queue with the script the Bridge accepts", async () => {
      await expect(
        withdrawalQueue
          .connect(maintainer)
          .finalizeRedeemAndBridge(
            REQUEST_ID,
            redemptionData(rescueRedemptionFixture.redeemerOutputScript),
          ),
      ).to.be.revertedWithCustomError(withdrawalQueue, "InvalidRedemptionData")
    })
  })

  describe("step 3 - upgrade the WithdrawalQueue", () => {
    let newImplementation: string
    let countBefore: bigint

    before(async () => {
      countBefore = await withdrawalQueue.count()

      const factory = await ethers.getContractFactory("WithdrawalQueue")
      const implementation = await factory.deploy()
      await implementation.waitForDeployment()
      newImplementation = await implementation.getAddress()

      // Use the real ProxyAdmin and its real owner, as governance will.
      const proxyAdmin = (await ethers.getContractAt(
        "ProxyAdmin",
        await upgrades.erc1967.getAdminAddress(ACRE.withdrawalQueue),
      )) as unknown as ProxyAdmin
      const proxyAdminOwner = await impersonate(await proxyAdmin.owner())

      await proxyAdmin
        .connect(proxyAdminOwner)
        .upgradeAndCall(ACRE.withdrawalQueue, newImplementation, "0x")

      // From here on we need the new ABI, which has fixRedeemerOutputScriptHash.
      withdrawalQueue = (await ethers.getContractAt(
        "WithdrawalQueue",
        ACRE.withdrawalQueue,
      )) as unknown as WithdrawalQueue
    })

    it("points the proxy at the new implementation", async () => {
      expect(
        await upgrades.erc1967.getImplementationAddress(ACRE.withdrawalQueue),
      ).to.equal(newImplementation)
    })

    // The upgrade adds no state variables. These checks show the old storage
    // is still read the same way.
    it("keeps the queue's state", async () => {
      expect(await withdrawalQueue.count()).to.equal(countBefore)
      expect(await withdrawalQueue.owner()).to.equal(ROLES.governance)
      expect(await withdrawalQueue.isMaintainer(ROLES.maintainer)).to.equal(
        true,
      )
      expect(await withdrawalQueue.tbtcBridge()).to.equal(EXTERNAL.bridge)
      expect(await tbtc.balanceOf(ACRE.withdrawalQueue)).to.equal(
        queueBalanceBefore,
      )
    })

    it("keeps request 1 as it was", async () => {
      const request = await withdrawalQueue.redemAndBridgeRequests(REQUEST_ID)
      expect(request.redeemer).to.equal(REQUEST.redeemer)
      expect(request.tbtcAmount).to.equal(REQUEST.tbtcAmount)
      expect(request.exitFeeInTbtc).to.equal(REQUEST.exitFeeInTbtc)
      expect(request.completedAt).to.equal(0n)
      expect(request.redeemerOutputScriptHash).to.equal(
        rescueRedemptionFixture.legacyRedeemerOutputScriptHash,
      )
    })
  })

  describe("step 4 - WithdrawalQueue.fixRedeemerOutputScriptHash", () => {
    it("rejects a caller that is not the owner", async () => {
      await expect(
        withdrawalQueue.connect(maintainer).fixRedeemerOutputScriptHash(),
      )
        .to.be.revertedWithCustomError(
          withdrawalQueue,
          "OwnableUnauthorizedAccount",
        )
        .withArgs(ROLES.maintainer)
    })

    it("saves the hash of the script with its length byte", async () => {
      // The script the Bridge accepts, with the same address as the stored
      // one: the stored script with only the length byte added.
      expect(
        ethers.keccak256(
          ethers.dataSlice(rescueRedemptionFixture.redeemerOutputScript, 1),
        ),
      ).to.equal(rescueRedemptionFixture.legacyRedeemerOutputScriptHash)
      const newHash = ethers.keccak256(
        rescueRedemptionFixture.redeemerOutputScript,
      )

      await withdrawalQueue.connect(governance).fixRedeemerOutputScriptHash()

      const request = await withdrawalQueue.redemAndBridgeRequests(REQUEST_ID)
      expect(request.redeemerOutputScriptHash).to.equal(newHash)
      // Nothing else changes.
      expect(request.redeemer).to.equal(REQUEST.redeemer)
      expect(request.tbtcAmount).to.equal(REQUEST.tbtcAmount)
      expect(request.exitFeeInTbtc).to.equal(REQUEST.exitFeeInTbtc)
      expect(request.completedAt).to.equal(0n)
    })
  })

  describe("step 5 - WithdrawalQueue.finalizeRedeemAndBridge(1)", () => {
    // The Bridge works in satoshi, so it truncates.
    const requestedAmountSat = REQUEST.tbtcAmount / SATOSHI_MULTIPLIER

    let treasuryFeeSat: bigint
    let txMaxFee: bigint
    let treasuryBalanceBefore: bigint

    before(async () => {
      // We read the parameters from the Bridge itself rather than writing them
      // down, because they are governable and a stale copy here would assert
      // the wrong number.
      const [, treasuryFeeDivisor, redemptionTxMaxFee] =
        await bridge.redemptionParameters()
      treasuryFeeSat = requestedAmountSat / treasuryFeeDivisor
      txMaxFee = redemptionTxMaxFee

      treasuryBalanceBefore = await tbtc.balanceOf(treasury)
    })

    it("gets the redemption accepted by the real tBTC Bridge", async () => {
      // Check the Bridge accepted our request, not just that some redemption
      // happened. Every argument is checked, the amount included.
      const tx = await withdrawalQueue
        .connect(maintainer)
        .finalizeRedeemAndBridge(
          REQUEST_ID,
          redemptionData(rescueRedemptionFixture.redeemerOutputScript),
        )

      await expect(tx)
        .to.emit(bridge, "RedemptionRequested")
        .withArgs(
          rescueRedemptionFixture.walletPubKeyHash,
          rescueRedemptionFixture.redeemerOutputScript,
          REQUEST.redeemer,
          requestedAmountSat,
          treasuryFeeSat,
          txMaxFee,
        )

      await expect(tx)
        .to.emit(withdrawalQueue, "RedeemCompletedAndBridgeRequested")
        .withArgs(REQUEST_ID, REQUEST.redeemer, REQUEST.tbtcAmount)
    })

    it("marks request 1 completed", async () => {
      expect(
        (await withdrawalQueue.redemAndBridgeRequests(REQUEST_ID)).completedAt,
      ).to.be.greaterThan(0n)
    })

    it("names the redeemer, so a timeout pays them back", async () => {
      // If the wallet does not pay out in time, `notifyRedemptionTimeout`
      // gives the amount back to this address as a Bank balance.
      const pending = await bridge.pendingRedemptions(redemptionKey)
      expect(pending.redeemer).to.equal(REQUEST.redeemer)
      expect(pending.requestedAmount).to.equal(requestedAmountSat)
      expect(pending.treasuryFee).to.equal(treasuryFeeSat)
      expect(pending.txMaxFee).to.equal(txMaxFee)
    })

    it("sends the exit fee to the acreBTC treasury", async () => {
      expect(await tbtc.balanceOf(treasury)).to.equal(
        treasuryBalanceBefore + REQUEST.exitFeeInTbtc,
      )
    })

    it("leaves only sub-satoshi dust on the queue", async () => {
      // TBTCVault unmints whole satoshi only, so what the Bridge truncated
      // stays on the queue, next to the dust that was already there. We assert
      // the exact amount rather than allowing any leftover.
      expect(
        await tbtc.balanceOf(ACRE.withdrawalQueue),
        "unexpected tBTC left on the WithdrawalQueue",
      ).to.equal(
        queueBalanceBefore -
          REQUEST.exitFeeInTbtc -
          requestedAmountSat * SATOSHI_MULTIPLIER,
      )
    })

    it("cannot be finalized again", async () => {
      await expect(
        withdrawalQueue
          .connect(maintainer)
          .finalizeRedeemAndBridge(
            REQUEST_ID,
            redemptionData(rescueRedemptionFixture.redeemerOutputScript),
          ),
      ).to.be.revertedWithCustomError(
        withdrawalQueue,
        "WithdrawalRequestAlreadyCompleted",
      )
    })
  })
})
