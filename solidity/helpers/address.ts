import { ethers } from "ethers"

// eslint-disable-next-line import/prefer-default-export
export function isNonZeroAddress(address: string): boolean {
  return ethers.getAddress(address) !== ethers.ZeroAddress
}
