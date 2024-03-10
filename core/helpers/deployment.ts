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

export default async function waitForTransaction(
  hre: HardhatRuntimeEnvironment,
  txHash: string,
) {
  if (hre.network.name === "hardhat") {
    return
  }

  const { provider } = hre.ethers
  const transaction = await provider.getTransaction(txHash)

  if (!transaction) {
    throw new Error(`Transaction ${txHash} not found`)
  }

  let currentConfirmations = await transaction.confirmations()
  const requiredConfirmations = waitConfirmationsNumber(hre)
  while (currentConfirmations < requiredConfirmations) {
    // wait 1s between each check to save API compute units
    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // eslint-disable-next-line no-await-in-loop
    currentConfirmations = await transaction.confirmations()
  }
}
