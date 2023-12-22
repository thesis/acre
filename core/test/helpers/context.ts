import { deployments } from "hardhat"

import { getDeployedContract } from "./contract"

import type {
  Acre,
  Dispatcher,
  TestERC20,
  TbtcDepositor,
  BridgeStub,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const acre: Acre = await getDeployedContract("Acre")
  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")

  const tbtcDepositor: TbtcDepositor =
    await getDeployedContract("TbtcDepositor")

  const bridge: BridgeStub = await getDeployedContract("Bridge")

  return { tbtc, acre, dispatcher, tbtcDepositor, bridge }
}
