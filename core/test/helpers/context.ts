import { deployments } from "hardhat"

import { getDeployedContract } from "./contract"

import type {
  Acre,
  Dispatcher,
  TestERC20,
  TbtcDepositor,
  TestERC4626,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const acre: Acre = await getDeployedContract("Acre")
  const tbtcDepositor: TbtcDepositor =
    await getDeployedContract("TbtcDepositor")
  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")
  const vault: TestERC4626 = await getDeployedContract("Vault")

  return { tbtc, acre, tbtcDepositor, dispatcher, vault }
}
