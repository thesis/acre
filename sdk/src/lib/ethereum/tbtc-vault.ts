import { Contract as EthersContract } from "ethers"
import { EthereumContractRunner, EthersContractWrapper } from "./contract"

const bridgeAbi = [
  {
    inputs: [],
    name: "optimisticMintingFeeDivisor",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

export default class TbtcVault extends EthersContractWrapper<EthersContract> {
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

  async optimisticMintingFeeDivisor(): Promise<bigint> {
    return (await this.instance.optimisticMintingFeeDivisor()) as bigint
  }
}
