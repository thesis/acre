/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { OrangeKitSdk } from "@orangekit/sdk"
import { ContractTransaction } from "ethers"

// @ts-expect-error Error: Property '#private' is missing in type
// 'MockOrangeKitSdk' but required in type 'OrangeKitSdk'.
// eslint-disable-next-line import/prefer-default-export
export class MockOrangeKitSdk implements OrangeKitSdk {
  #chainId: number

  constructor() {
    this.#chainId = 1
  }

  get chainId(): number {
    return this.#chainId
  }

  predictAddress(
    bitcoinAddress: string,
    publicKey?: string,
  ): Promise<`0x${string}`> {
    return Promise.resolve("0x126A16657b7293fdf5D963d6A6E8B9ec387D53e1")
  }

  populateSafeDeploymentTransaction(
    bitcoinAddress: string,
    publicKey?: string,
  ): Promise<ContractTransaction> {
    return Promise.resolve({} as ContractTransaction)
  }

  sendTransaction(
    to: string,
    value: string,
    data: string,
    bitcoinAddress: string,
    publicKey: string,
    bitcoinSignMessageFn: (message: string) => Promise<string>,
  ): Promise<string> {
    return Promise.resolve("0x0")
  }
}
