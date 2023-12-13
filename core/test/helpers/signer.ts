import { ethers, getNamedAccounts, getUnnamedAccounts } from "hardhat"

import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

/**
 * Get named Hardhat Ethers Signers.
 * @returns Map of named Hardhat Ethers Signers.
 */
export async function getNamedSigner(): Promise<{
  [name: string]: HardhatEthersSigner
}> {
  const namedSigners: { [name: string]: HardhatEthersSigner } = {}

  await Promise.all(
    Object.entries(await getNamedAccounts()).map(async ([name, address]) => {
      namedSigners[name] = await ethers.getSigner(address)
    }),
  )

  return namedSigners
}

/**
 * Get unnamed Hardhat Ethers Signers.
 * @returns Array of unnamed Hardhat Ethers Signers.
 */
export async function getUnnamedSigner(): Promise<HardhatEthersSigner[]> {
  const accounts = await getUnnamedAccounts()

  return await Promise.all(accounts.map(ethers.getSigner))
}
