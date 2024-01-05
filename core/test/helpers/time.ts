/* eslint-disable import/prefer-default-export */
import { ethers } from "hardhat"

/**
 * Returns timestamp of the latest block.
 * @return {number} Latest block timestamp.
 */
export async function lastBlockTime(): Promise<number> {
  return (await ethers.provider.getBlock("latest"))!.timestamp
}
