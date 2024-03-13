/* eslint-disable import/prefer-default-export */
import { ethers } from "ethers"
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { StBTC } from "../../typechain"

type BaseMessage = {
  nonce?: bigint
  deadline?: bigint
  [key: string]: unknown
}

type RedeemToBitcoinMessage = BaseMessage & {
  owner: string
  shares: bigint
  bitcoinOutputScript: string
}

type WithdrawToBitcoinMessage = BaseMessage & {
  owner: string
  assets: bigint
  bitcoinOutputScript: string
}

type SignTypedDataResult<K extends BaseMessage> = {
  signature: ethers.Signature
  message: Required<K>
}

const RedeemToBitcoinTypes = {
  RedeemToBitcoin: [
    { name: "owner", type: "address" },
    { name: "shares", type: "uint256" },
    { name: "bitcoinOutputScript", type: "bytes" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
}

const WithdrawToBitcoinTypes = {
  WithdrawToBitcoin: [
    { name: "owner", type: "address" },
    { name: "assets", type: "uint256" },
    { name: "bitcoinOutputScript", type: "bytes" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
}

export class StbtcEIP712Helper {
  readonly #stbtc: StBTC

  constructor(stbtc: StBTC) {
    this.#stbtc = stbtc
  }

  async signRedeemToBitcoin(
    signer: HardhatEthersSigner,
    owner: string,
    shares: bigint,
    redeemerOutputScript: string,
    deadline?: bigint,
    nonce?: bigint,
  ) {
    if (!nonce) {
      // eslint-disable-next-line no-param-reassign
      nonce = await this.#stbtc.nonces(owner)
    }
    if (!deadline) {
      // eslint-disable-next-line no-param-reassign
      deadline = BigInt(await time.latest()) + 1000n
    }

    const value: RedeemToBitcoinMessage = {
      owner,
      shares,
      bitcoinOutputScript: redeemerOutputScript,
      nonce,
      deadline,
    }

    const types = RedeemToBitcoinTypes

    return this.signTypedData(signer, owner, types, value)
  }

  async signWithdrawToBitcoin(
    signer: HardhatEthersSigner,
    owner: string,
    assets: bigint,
    redeemerOutputScript: string,
    deadline?: bigint,
    nonce?: bigint,
  ) {
    if (!nonce) {
      // eslint-disable-next-line no-param-reassign
      nonce = await this.#stbtc.nonces(owner)
    }
    if (!deadline) {
      // eslint-disable-next-line no-param-reassign
      deadline = BigInt(await time.latest()) + 1000n
    }

    const value: WithdrawToBitcoinMessage = {
      owner,
      assets,
      bitcoinOutputScript: redeemerOutputScript,
      nonce,
      deadline,
    }

    return this.signTypedData(signer, owner, WithdrawToBitcoinTypes, value)
  }

  async signTypedData<K extends BaseMessage>(
    signer: HardhatEthersSigner,
    owner: string,
    types: Record<string, ethers.TypedDataField[]>,
    message: K,
  ): Promise<SignTypedDataResult<K>> {
    if (!message.nonce) {
      // eslint-disable-next-line no-param-reassign
      message = { ...message, nonce: await this.#stbtc.nonces(owner) }
    }
    if (!message.deadline) {
      // eslint-disable-next-line no-param-reassign
      message = { ...message, deadline: BigInt(await time.latest()) + 1000n }
    }

    const messageToSign: Required<K> = message as Required<K>

    const { chainId } = await signer.provider.getNetwork()

    const domain = {
      name: "Acre Staked Bitcoin",
      version: "1",
      chainId,
      verifyingContract: await this.#stbtc.getAddress(),
    }

    const sig = await signer.signTypedData(domain, types, messageToSign)

    return { signature: ethers.Signature.from(sig), message: messageToSign }
  }
}
