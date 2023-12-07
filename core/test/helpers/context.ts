import { deployments } from "hardhat"

import { getDeployedContract } from "./contract"

import type { Acre, TestERC20 } from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const acre: Acre = await getDeployedContract("Acre")

  return { tbtc, acre }
}
