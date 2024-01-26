import { deployments, ethers } from "hardhat"

import type { BaseContract } from "ethers"
import { getUnnamedSigner } from "./signer"

/**
 * Get instance of a contract from Hardhat Deployments.
 * @param deploymentName Name of the contract deployment.
 * @returns Deployed Ethers contract instance.
 */
// eslint-disable-next-line import/prefer-default-export
export async function getDeployedContract<T extends BaseContract>(
  deploymentName: string,
): Promise<T> {
  const { address, abi } = await deployments.get(deploymentName)

  // Use default unnamed signer from index 0 to initialize the contract runner.
  const [defaultSigner] = await getUnnamedSigner()

  return new ethers.BaseContract(address, abi, defaultSigner) as T
}
