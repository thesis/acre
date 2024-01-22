import { deployments } from "hardhat"
import { getDeployedContract } from "./contract"

import type {
  Acre,
  Dispatcher,
  TestERC20,
  TbtcDepositor,
  BridgeStub,
  TestERC4626,
  TBTCVaultStub,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const acre: Acre = await getDeployedContract("Acre")
  const tbtcDepositor: TbtcDepositor =
    await getDeployedContract("TbtcDepositor")

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const tbtcBridge: BridgeStub = await getDeployedContract("Bridge")
  const tbtcVault: TBTCVaultStub = await getDeployedContract("TBTCVault")

  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")

  const vault: TestERC4626 = await getDeployedContract("Vault")

  return { tbtc, acre, tbtcDepositor, tbtcBridge, tbtcVault, dispatcher, vault }
}
