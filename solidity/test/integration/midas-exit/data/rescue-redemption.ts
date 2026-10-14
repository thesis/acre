/* eslint-disable import/prefer-default-export */
/**
 * tBTC redemption data for the rescue of WithdrawalQueue request 1. Only valid
 * at the block in `validAtBlock`.
 *
 * The tBTC Bridge only accepts a redemption that names a Live wallet together
 * with that wallet's current main UTXO, and both change every time the wallet
 * moves coins on the Bitcoin side. See the header of `./redemption.ts` for the
 * details.
 *
 * The values were found by picking a Live wallet in the Threshold explorer
 * (https://app.threshold.network/explorer?tab=wallets) and running:
 *
 *   MAINNET_RPC_URL=<url> WALLET_ADDRESS=bc1qk369mypsv63w5l20l46uk2p0myr5cq685de44q \
 *     npx hardhat run scripts/find-redemption-wallet.ts
 *
 * To move to a newer block, run that script again and copy every field it
 * prints, `validAtBlock` included. Do not change single fields by hand. The
 * UTXO, the wallet and the block all have to match each other.
 */
export const rescueRedemptionFixture = {
  /**
   * The block the fork test runs at. It is after acreBTC was detached from the
   * WithdrawalQueue (2026-09-24), so the test runs against the real current
   * state of production.
   */
  validAtBlock: 26184265,

  /**
   * A tBTC wallet that is Live at `validAtBlock`, with the Bitcoin address
   * bc1qk369mypsv63w5l20l46uk2p0myr5cq685de44q.
   */
  walletPubKeyHash: "0xb4745d903066a2ea7d4ffd75cb282fd9074c0347",

  /**
   * That wallet's main UTXO. Its `keccak256(txHash | outputIndex | value)` is
   * the same as `Bridge.wallets(walletPubKeyHash).mainUtxoHash` at
   * `validAtBlock`.
   */
  mainUtxo: {
    txHash:
      "0x17cd5e16a8f33175b1ed32698d81a0dddb5e541a37b878f011a4503d4e4726f9",
    txOutputIndex: 0,
    txOutputValue: 134638081039n,
  },

  /**
   * Request 1's own redeemer output script, a P2WPKH script for
   * bc1quv9n8egtcuz2f33qauvq7ny0hk4g76f804y5s3, with the length byte in front
   * (`0x16` means 22 bytes) as the Bridge expects.
   */
  redeemerOutputScript: "0x160014e30b33e50bc704a4c620ef180f4c8fbdaa8f6927",

  /**
   * What request 1 stored on chain: the hash of the same script WITHOUT the
   * length byte. The Bridge rejects that script, so the request can never be
   * finalized until the hash is repaired.
   */
  legacyRedeemerOutputScriptHash:
    "0xaa0c73dee4d3456529288740c0cba4dcd7a266a0538d68b4b4d24e7acb73984b",
} as const
