import { packRevealDepositParameters } from "@keep-network/tbtc-v2.ts"
import { AcreBitcoinDepositor as AcreBitcoinDepositorTypechain } from "@acre-btc/core/typechain/contracts/AcreBitcoinDepositor"
import {
  ZeroAddress,
  dataSlice,
  getAddress,
  isAddress,
  solidityPacked,
  zeroPadBytes,
  Contract,
} from "ethers"
import {
  ChainIdentifier,
  DecodedExtraData,
  BitcoinDepositor,
  DepositReceipt,
  StakingFees,
} from "../contracts"
import { BitcoinRawTxVectors } from "../bitcoin"
import { EthereumAddress } from "./address"
import {
  EthersContractConfig,
  EthersContractDeployment,
  EthersContractWrapper,
} from "./contract"
import { Hex } from "../utils"
import { EthereumNetwork } from "./network"

import SepoliaBitcoinDepositor from "./artifacts/sepolia/AcreBitcoinDepositor.json"

type TbtcDepositParameters = {
  depositTreasuryFeeDivisor: bigint
  depositTxMaxFee: bigint
}

/**
 * Ethereum implementation of the BitcoinDepositor.
 */
class EthereumBitcoinDepositor
  // @ts-expect-error TODO: Figure out why type generated by typechain does not
  // satisfy the constraint `Contract`. Error: `Property '[internal]' is missing
  // in type 'AcreBitcoinDepositor' but required in type 'Contract'`.
  extends EthersContractWrapper<AcreBitcoinDepositorTypechain>
  implements BitcoinDepositor
{
  /**
   * Multiplier to convert satoshi to tBTC token units.
   */
  readonly #satoshiMultiplier = 10n ** 10n

  #tbtcBridgeDepositsParameters: TbtcDepositParameters | undefined

  #tbtcOptimisticMintingFeeDivisor: bigint | undefined

  constructor(config: EthersContractConfig, network: EthereumNetwork) {
    let artifact: EthersContractDeployment

    switch (network) {
      case "sepolia":
        artifact = SepoliaBitcoinDepositor
        break
      case "mainnet":
      default:
        throw new Error("Unsupported network")
    }

    super(config, artifact)
  }

  /**
   * @see {BitcoinDepositor#getChainIdentifier}
   */
  getChainIdentifier(): ChainIdentifier {
    return this.getAddress()
  }

  /**
   * @see {BitcoinDepositor#getTbtcVaultChainIdentifier}
   */
  async getTbtcVaultChainIdentifier(): Promise<ChainIdentifier> {
    const vault = await this.instance.tbtcVault()

    return EthereumAddress.from(vault)
  }

  /**
   * @see {BitcoinDepositor#revealDeposit}
   */
  async revealDeposit(
    depositTx: BitcoinRawTxVectors,
    depositOutputIndex: number,
    deposit: DepositReceipt,
  ): Promise<Hex> {
    const { fundingTx, reveal, extraData } = packRevealDepositParameters(
      depositTx,
      depositOutputIndex,
      deposit,
      await this.getTbtcVaultChainIdentifier(),
    )

    if (!extraData) throw new Error("Invalid extra data")

    const { staker, referral } = this.decodeExtraData(extraData)

    const tx = await this.instance.initializeStake(
      fundingTx,
      reveal,
      `0x${staker.identifierHex}`,
      referral,
    )

    return Hex.from(tx.hash)
  }

  /**
   * @see {BitcoinDepositor#encodeExtraData}
   * @dev Packs the data to bytes32: 20 bytes of staker address and 2 bytes of
   *      referral, 10 bytes of trailing zeros.
   */
  // eslint-disable-next-line class-methods-use-this
  encodeExtraData(staker: ChainIdentifier, referral: number): Hex {
    const stakerAddress = `0x${staker.identifierHex}`

    if (!isAddress(stakerAddress) || stakerAddress === ZeroAddress)
      throw new Error("Invalid staker address")

    const encodedData = solidityPacked(
      ["address", "uint16"],
      [stakerAddress, referral],
    )

    return Hex.from(zeroPadBytes(encodedData, 32))
  }

  /**
   * @see {BitcoinDepositor#decodeExtraData}
   * @dev Unpacks the data from bytes32: 20 bytes of staker address and 2
   *      bytes of referral, 10 bytes of trailing zeros.
   */
  // eslint-disable-next-line class-methods-use-this
  decodeExtraData(extraData: string): DecodedExtraData {
    const staker = EthereumAddress.from(getAddress(dataSlice(extraData, 0, 20)))
    const referral = Number(dataSlice(extraData, 20, 22))

    return { staker, referral }
  }

  /**
   * @see {BitcoinDepositor#estimateStakingFees}
   */
  async estimateStakingFees(amountToStake: bigint): Promise<StakingFees> {
    const { depositTreasuryFeeDivisor, depositTxMaxFee } =
      await this.#getTbtcDepositParameters()

    const treasuryFee =
      depositTreasuryFeeDivisor > 0
        ? amountToStake / depositTreasuryFeeDivisor
        : 0n

    // Both deposit amount and treasury fee are in the 1e8 satoshi precision.
    // We need to convert them to the 1e18 TBTC precision.
    const amountSubTreasury =
      (amountToStake - treasuryFee) * this.#satoshiMultiplier

    const optimisticMintingFeeDivisor =
      await this.#getTbtcOptimisticMintingFeeDivisor()
    const optimisticMintingFee =
      optimisticMintingFeeDivisor > 0
        ? amountSubTreasury / optimisticMintingFeeDivisor
        : 0n

    const depositorFeeDivisor = await this.instance.depositorFeeDivisor()
    // Compute depositor fee. The fee is calculated based on the initial funding
    // transaction amount, before the tBTC protocol network fees were taken.
    const depositorFee =
      depositorFeeDivisor > 0n
        ? (amountToStake * this.#satoshiMultiplier) / depositorFeeDivisor
        : 0n

    return {
      tbtc: {
        treasuryFee: treasuryFee * this.#satoshiMultiplier,
        optimisticMintingFee,
        depositTxMaxFee: depositTxMaxFee * this.#satoshiMultiplier,
      },
      acre: {
        depositorFee,
      },
    }
  }

  async #getTbtcDepositParameters(): Promise<TbtcDepositParameters> {
    if (this.#tbtcBridgeDepositsParameters) {
      return this.#tbtcBridgeDepositsParameters
    }

    const bridgeAddress = await this.instance.bridge()

    const bridge = new Contract(bridgeAddress, [
      "function depositsParameters()",
    ])

    const depositsParameters =
      (await bridge.depositsParameters()) as TbtcDepositParameters

    this.#tbtcBridgeDepositsParameters = depositsParameters

    return depositsParameters
  }

  async #getTbtcOptimisticMintingFeeDivisor(): Promise<bigint> {
    if (this.#tbtcOptimisticMintingFeeDivisor) {
      return this.#tbtcOptimisticMintingFeeDivisor
    }

    const vaultAddress = await this.getTbtcVaultChainIdentifier()

    const vault = new Contract(`0x${vaultAddress.identifierHex}`, [
      "function optimisticMintingFeeDivisor()",
    ])

    const optimisticMintingFeeDivisor =
      (await vault.optimisticMintingFeeDivisor()) as bigint

    this.#tbtcOptimisticMintingFeeDivisor = optimisticMintingFeeDivisor

    return optimisticMintingFeeDivisor
  }
}

export { EthereumBitcoinDepositor, packRevealDepositParameters }
