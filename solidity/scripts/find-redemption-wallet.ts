/* eslint-disable no-console */
/**
 * Prints the redemption data to pass to
 * `WithdrawalQueue.finalizeRedeemAndBridge(1, ...)` for a given tBTC wallet.
 *
 * The tBTC Bridge only accepts a redemption that names a Live wallet and that
 * wallet's current main UTXO. The Bridge stores only
 * `keccak256(txHash | outputIndex | value)` of that UTXO, so we take the
 * wallet's UTXOs from Bitcoin and keep the one that matches.
 *
 * Pick a Live wallet in the Threshold explorer
 * (https://app.threshold.network/explorer?tab=wallets) and run:
 *
 *   MAINNET_RPC_URL=<url> WALLET_ADDRESS=<bc1q...> \
 *     npx hardhat run scripts/find-redemption-wallet.ts
 *
 * Nothing is sent. The script only reads from mempool.space and the Bridge.
 */
import { ethers } from "ethers"

import bridgeArtifact from "../external/mainnet/Bridge.json"
import type { Bridge } from "../typechain/external"

const MEMPOOL_API = "https://mempool.space/api"
const WALLET_STATE_LIVE = 1n

/** WithdrawalQueue request 1: its redeemer and its script with the length byte. */
const REQUEST = {
  redeemer: "0xDcBC417BC341d1974d88B78Ac460e4e9306b9Ee0",
  redeemerOutputScript: "0x160014e30b33e50bc704a4c620ef180f4c8fbdaa8f6927",
}

interface ValidatedAddress {
  isvalid: boolean
  iswitness?: boolean
  witness_version?: number
  witness_program?: string
}

interface Utxo {
  txid: string
  vout: number
  value: number
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${MEMPOOL_API}${path}`)
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`)
  }
  return (await response.json()) as T
}

async function main(): Promise<void> {
  const rpcUrl = process.env.MAINNET_RPC_URL
  const walletAddress = process.env.WALLET_ADDRESS
  if (!rpcUrl) throw new Error("Set MAINNET_RPC_URL")
  if (!walletAddress) throw new Error("Set WALLET_ADDRESS")

  // tBTC wallets use P2WPKH addresses. The witness program is the wallet
  // public key hash.
  const address = await getJson<ValidatedAddress>(
    `/v1/validate-address/${walletAddress}`,
  )
  if (
    !address.isvalid ||
    !address.iswitness ||
    address.witness_version !== 0 ||
    address.witness_program?.length !== 40
  ) {
    throw new Error(`${walletAddress} is not a tBTC wallet (P2WPKH) address`)
  }
  const walletPubKeyHash = `0x${address.witness_program}`

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const bridge = new ethers.Contract(
    bridgeArtifact.address,
    bridgeArtifact.abi,
    provider,
  ) as unknown as Bridge

  const block = await provider.getBlockNumber()
  const wallet = await bridge.wallets(walletPubKeyHash, { blockTag: block })
  if (wallet.state !== WALLET_STATE_LIVE) {
    throw new Error(
      `Wallet ${walletPubKeyHash} is not Live (state ${wallet.state})`,
    )
  }

  // The Bridge uses the transaction hash in the reverse byte order to the
  // txid that Bitcoin explorers show.
  const utxos = await getJson<Utxo[]>(`/address/${walletAddress}/utxo`)
  const mainUtxo = utxos
    .map(({ txid, vout, value }) => ({
      txHash: `0x${Buffer.from(txid, "hex").reverse().toString("hex")}`,
      txOutputIndex: vout,
      txOutputValue: BigInt(value),
    }))
    .find(
      ({ txHash, txOutputIndex, txOutputValue }) =>
        ethers.solidityPackedKeccak256(
          ["bytes32", "uint32", "uint64"],
          [txHash, txOutputIndex, txOutputValue],
        ) === wallet.mainUtxoHash,
    )
  if (!mainUtxo) {
    throw new Error(
      `None of the ${utxos.length} UTXOs of ${walletAddress} is the main UTXO ` +
        "the Bridge stores. The wallet's latest Bitcoin transaction is probably " +
        "not proven to the Bridge yet. Retry later or pick another wallet.",
    )
  }

  const redemptionData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "bytes20", "bytes32", "uint32", "uint64", "bytes"],
    [
      REQUEST.redeemer,
      walletPubKeyHash,
      mainUtxo.txHash,
      mainUtxo.txOutputIndex,
      mainUtxo.txOutputValue,
      REQUEST.redeemerOutputScript,
    ],
  )

  console.log(
    JSON.stringify(
      {
        validAtBlock: block,
        walletAddress,
        walletPubKeyHash,
        mainUtxo: {
          txHash: mainUtxo.txHash,
          txOutputIndex: mainUtxo.txOutputIndex,
          txOutputValue: mainUtxo.txOutputValue.toString(),
        },
        redemptionData,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
