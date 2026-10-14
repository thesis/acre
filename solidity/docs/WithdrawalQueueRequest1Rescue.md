# Rescue of WithdrawalQueue request 1

WithdrawalQueue request 1 has held 0.014985 tBTC since 2025-10-05. It saved the
hash of the redeemer output script without the length byte, and the tBTC Bridge
rejects that script, so `finalizeRedeemAndBridge(1, ...)` always reverts. The
rescue upgrades the queue, repairs the hash and finalizes the request. The BTC
goes to the address the user asked for in the original request.

## Addresses (mainnet)

| Name                                                  | Address                                      |
| ----------------------------------------------------- | -------------------------------------------- |
| WithdrawalQueue (proxy)                               | `0xe7b8c14cA8Fb4f226C0A3e45e636b84809BB5D06` |
| WithdrawalQueue ProxyAdmin                            | `0x147378daf5cdca7b7583876f8d32522aae943589` |
| Governance (owner of the queue and of its ProxyAdmin) | `0x790Dda4c56b3c45d0e4514eDbAaBa30D7129c857` |
| Maintainer                                            | `0x373C177845cEfaB4Ed85666b99c9fDB40ae7Cd19` |

## Request 1

| Field               | Value                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Request transaction | [`0x1d2980a5…bde1f`](https://etherscan.io/tx/0x1d2980a5e55c9201445da5580aa65c304ea046728ee0def257d30469795bde1f) |
| Redeemer            | `0xDcBC417BC341d1974d88B78Ac460e4e9306b9Ee0`                                                                     |
| BTC address         | `bc1quv9n8egtcuz2f33qauvq7ny0hk4g76f804y5s3`                                                                     |
| tBTC amount         | `14947630922693266` (1 494 763 sat to the Bridge)                                                                |
| Exit fee            | `37369077306734` (goes to the acreBTC treasury)                                                                  |

## Calls

### 1. Upgrade the WithdrawalQueue

Deploy the new implementation with the `UpgradeWithdrawalQueue` deploy script
(`deploy/79_upgrade_withdrawal_queue.ts`; remove its `func.skip` first):

```
pnpm run deploy --tags UpgradeWithdrawalQueue --network mainnet
```

It checks the storage layout against `.openzeppelin/mainnet.json`, deploys the
implementation, verifies it on Etherscan and prints the upgrade transaction.
**Governance** sends it to the **ProxyAdmin**:

```
upgradeAndCall(
  proxy:          0xe7b8c14cA8Fb4f226C0A3e45e636b84809BB5D06,
  implementation: <new WithdrawalQueue implementation>,
  data:           0x
)
```

### 2. Repair the script hash of request 1

**Governance** calls on the **WithdrawalQueue**:

```
fixRedeemerOutputScriptHash()
```

The contract has the new hash hardcoded,
`0x446dfb310b0b403f5ce6b5d5cbb6fc32f4b23a16c18be21e969172868adf57bd`: the hash
of request 1's script with the length byte (`0x160014e30b…6927`, P2WPKH for
`bc1quv9n8egtcuz2f33qauvq7ny0hk4g76f804y5s3`). The request stored the hash of
the same script without it (`0xaa0c73de…984b`), because of an old SDK bug, so
the BTC address does not change.

The script without the length byte is in the
[request transaction](https://etherscan.io/tx/0x1d2980a5e55c9201445da5580aa65c304ea046728ee0def257d30469795bde1f).
On Etherscan, decode the Safe `execTransaction` input. Its `data` is
`acreBTC.approveAndCall`, whose last argument is the redemption data, and the
script is the last field of that data: `0x0014e30b33e50bc704a4c620ef180f4c8fbdaa8f6927`.
The transaction emits `RedeemAndBridgeRequested` with `requestId` 1.

### 3. Finalize request 1

Right before sending, pick a Live wallet in the Threshold explorer
(https://app.threshold.network/explorer?tab=wallets) and run:

```
MAINNET_RPC_URL=<url> WALLET_ADDRESS=<bc1q...> \
  npx hardhat run scripts/find-redemption-wallet.ts
```

Then the **maintainer** calls on the **WithdrawalQueue**:

```
finalizeRedeemAndBridge(
  _requestId:          1,
  _tbtcRedemptionData: <redemptionData printed by the script>
)
```

The redemption data names the wallet's current main UTXO, which changes every
time the wallet moves coins. If the call reverts with `Invalid main UTXO data`,
run the script again.

The acre-api `processWithdrawals` cron skips request 1 (`id_not_in: ["1"]`).
Keep that filter and send this call by hand with the maintainer key.

## Expected result

- The Bridge emits `RedemptionRequested` for 1 494 763 sat to
  `bc1quv9n8egtcuz2f33qauvq7ny0hk4g76f804y5s3`. The user receives that minus the
  Bridge treasury fee (amount / 500) and the Bitcoin transaction fee.
- The acreBTC treasury receives the exit fee, `37369077306734` wei tBTC.
- Request 1 is completed. Only sub-satoshi dust stays on the queue.
- If the wallet does not pay out in time, `notifyRedemptionTimeout` returns the
  amount to the redeemer `0xDcBC...` as a tBTC Bank balance.

## Rehearsal

`test/integration/midas-exit/StuckRedemptionRescue.test.ts` runs the three
calls on a mainnet fork against the real contracts:

```
MAINNET_RPC_URL=<rpc url> npx hardhat test \
  test/integration/midas-exit/StuckRedemptionRescue.test.ts --network hardhat
```
