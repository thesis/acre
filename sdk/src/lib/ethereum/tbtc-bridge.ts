import { Contract as EthersContract } from "ethers"
import { EthereumContractRunner, EthersContractWrapper } from "./contract"

const bridgeAbi = [
  {
    inputs: [],
    name: "depositParameters",
    outputs: [
      {
        internalType: "uint64",
        name: "depositDustThreshold",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "depositTreasuryFeeDivisor",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "depositTxMaxFee",
        type: "uint64",
      },
      {
        internalType: "uint32",
        name: "depositRevealAheadPeriod",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "redemptionParameters",
    outputs: [
      {
        internalType: "uint64",
        name: "redemptionDustThreshold",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "redemptionTreasuryFeeDivisor",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "redemptionTxMaxFee",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "redemptionTxMaxTotalFee",
        type: "uint64",
      },
      {
        internalType: "uint32",
        name: "redemptionTimeout",
        type: "uint32",
      },
      {
        internalType: "uint96",
        name: "redemptionTimeoutSlashingAmount",
        type: "uint96",
      },
      {
        internalType: "uint32",
        name: "redemptionTimeoutNotifierRewardMultiplier",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

type DepositParameters = {
  depositDustThreshold: bigint
  depositTreasuryFeeDivisor: bigint
  depositTxMaxFee: bigint
  depositRevealAheadPeriod: number
}

type RedemptionParameters = {
  redemptionDustThreshold: bigint
  redemptionTreasuryFeeDivisor: bigint
  redemptionTxMaxFee: bigint
  redemptionTxMaxTotalFee: bigint
  redemptionTimeout: number
  redemptionTimeoutSlashingAmount: bigint
  redemptionTimeoutNotifierRewardMultiplier: number
}

export default class TbtcBridge extends EthersContractWrapper<EthersContract> {
  constructor(runner: EthereumContractRunner, address: string) {
    super(
      {
        address,
        runner,
      },
      {
        address,
        abi: bridgeAbi,
      },
    )
  }

  async depositParameters(): Promise<DepositParameters> {
    return (await this.instance.depositParameters()) as DepositParameters
  }

  async redemptionParameters(): Promise<RedemptionParameters> {
    return (await this.instance.redemptionParameters()) as RedemptionParameters
  }
}
