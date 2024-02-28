/* eslint-disable import/prefer-default-export */
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Returns number of confirmations the deployment script should wait for a given
 * network. One confirmation is not enough for the Etherscan verification to work
 * due to the time needed for propagation of deployed contract.
 *
 * @param hre Hardhat Runtime Environment instance.
 * @returns Number of confirmations to wait.
 */
export function waitConfirmationsNumber(
  hre: HardhatRuntimeEnvironment,
): number {
  switch (hre.network.name) {
    case "mainnet":
    case "sepolia":
      return 2
    default:
      return 1
  }
}

export async function fetchDeploymentArtifact(
  hre: HardhatRuntimeEnvironment,
  name: string,
) {
  const { deployments } = hre

  if (hre.network.name === "integration") {
    const artifact = deployments.getArtifact(name)
    return artifact
  }
  return deployments.getOrNull(name)
}
