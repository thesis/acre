import { deployments } from "hardhat"
import { getDeployedContract } from "./contract"

import type {
  StBTC as stBTC,
  Dispatcher,
  TestERC20,
  TestERC4626,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const stbtc: stBTC = await getDeployedContract("stBTC")
  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")
  const vault: TestERC4626 = await getDeployedContract("Vault")

  return { tbtc, stbtc, dispatcher, vault }
}
