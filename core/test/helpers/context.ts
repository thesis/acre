import { deployments } from "hardhat"
import { getDeployedContract } from "./contract"

import type {
  StBTC as stBTC,
  TestERC20,
  BridgeStub,
  TestERC4626,
  TBTCVaultStub,
  AcreBitcoinDepositor,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const stbtc: stBTC = await getDeployedContract("stBTC")
  const bitcoinDepositor: AcreBitcoinDepositor = await getDeployedContract(
    "AcreBitcoinDepositor",
  )

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const tbtcBridge: BridgeStub = await getDeployedContract("Bridge")
  const tbtcVault: TBTCVaultStub = await getDeployedContract("TBTCVault")

  const vault: TestERC4626 = await getDeployedContract("Vault")

  return {
    tbtc,
    stbtc,
    bitcoinDepositor,
    tbtcBridge,
    tbtcVault,
    vault,
  }
}
