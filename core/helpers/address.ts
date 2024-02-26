import { ethers } from "ethers"
import { HardhatRuntimeEnvironment } from 'hardhat/types';

// eslint-disable-next-line import/prefer-default-export
export function isNonZeroAddress(address: string): boolean {
  return ethers.getAddress(address) !== ethers.ZeroAddress
}

export async function fetchDeploymentArtifact(hre: HardhatRuntimeEnvironment, name: string) {
  const { deployments } = hre

  if (hre.network.name === "integration") {
    return deployments.getArtifact(name)
  }
  return deployments.getOrNull(name)
}
