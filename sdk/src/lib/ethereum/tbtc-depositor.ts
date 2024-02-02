import {
  DepositReceipt,
  packRevealDepositParameters as tbtcPackRevealDepositParameters,
} from "@keep-network/tbtc-v2.ts"
import { TbtcDepositor as TbtcDepositorTypechain } from "core/typechain/contracts/TbtcDepositor"
import TbtcDepositor from "core/build/contracts/TbtcDepositor.sol/TbtcDepositor.json"
import { dataSlice, getAddress, solidityPacked, zeroPadBytes } from "ethers"
import { ChainIdentifier, DecodedExtraData, TBTCDepositor } from "../contracts"
import { BitcoinRawTxVectors } from "../bitcoin"
import { EthereumAddress } from "./address"
import { EthersContractConfig, EthersContractWrapper } from "./contract"
import { Hex } from "../utils"

/**
 * Ethereum implementation of the TBTCDepositor.
 */
class EthereumTBTCDepositor
  // @ts-expect-error TODO: Figure out why type generated by typechain does not
  // satisfy the constraint `Contract`. Error: `Property '[internal]' is missing
  // in type 'TbtcDepositor' but required in type 'Contract'`.
  extends EthersContractWrapper<TbtcDepositorTypechain>
  implements TBTCDepositor
{
  constructor(config: EthersContractConfig) {
    super(
      config,
      // TODO: get artifact from `core` package.
      {
        abi: TbtcDepositor.abi,
        address: "0x008b3b2f992c0e14edaa6e2c662bec549caa8df1",
        receipt: {
          blockNumber: 1,
        },
      },
    )
  }

  /**
   * @see {TBTCDepositor#getChainIdentifier}
   */
  getChainIdentifier(): ChainIdentifier {
    return this.getAddress()
  }

  /**
   * @see {TBTCDepositor#getTbtcVaultChainIdentifier}
   */
  async getTbtcVaultChainIdentifier(): Promise<ChainIdentifier> {
    const vault = await this.instance.tbtcVault()

    return EthereumAddress.from(vault)
  }

  /**
   * @see {TBTCDepositor#revealDeposit}
   */
  async revealDeposit(
    depositTx: BitcoinRawTxVectors,
    depositOutputIndex: number,
    deposit: DepositReceipt,
  ): Promise<Hex> {
    const { fundingTx, reveal, extraData } = tbtcPackRevealDepositParameters(
      depositTx,
      depositOutputIndex,
      deposit,
      await this.getTbtcVaultChainIdentifier(),
    )

    if (!extraData) throw new Error("Invalid extra data")

    const { staker, referral } = this.decodeExtraData(extraData)

    const tx = await this.instance.initializeStakeRequest(
      fundingTx,
      reveal,
      `0x${staker.identifierHex}`,
      referral,
    )

    return Hex.from(tx.hash)
  }

  /**
   * @see {TBTCDepositor#encodeExtraData}
   * @dev Packs the data to bytes32: 20 bytes of receiver address and 2 bytes of
   *      referral, 10 bytes of trailing zeros.
   */
  // eslint-disable-next-line class-methods-use-this
  encodeExtraData(staker: ChainIdentifier, referral: number): Hex {
    const encodedData = solidityPacked(
      ["address", "uint16"],
      [`0x${staker.identifierHex}`, referral],
    )

    return Hex.from(zeroPadBytes(encodedData, 32))
  }

  /**
   * @see {TBTCDepositor#decodeExtraData}
   * @dev Unpacks the data from bytes32: 20 bytes of receiver address and 2
   *      bytes of referral, 10 bytes of trailing zeros.
   */
  // eslint-disable-next-line class-methods-use-this
  decodeExtraData(extraData: string): DecodedExtraData {
    const staker = EthereumAddress.from(getAddress(dataSlice(extraData, 0, 20)))
    const referral = Number(dataSlice(extraData, 20, 22))

    return { staker, referral }
  }
}

// eslint-disable-next-line import/prefer-default-export
export { EthereumTBTCDepositor }
