import { deployments } from "hardhat"
import { getDeployedContract } from "./contract"

import type {
  StBTC as stBTC,
  Dispatcher,
  TestERC20,
  BridgeStub,
  TestERC4626,
  TBTCVaultStub,
  AcreBitcoinDepositorHarness,
  MezoAllocator,
  MezoPortalStub,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const stbtc: stBTC = await getDeployedContract("stBTC")
  const bitcoinDepositor: AcreBitcoinDepositorHarness =
    await getDeployedContract("AcreBitcoinDepositor")

  const tbtc: TestERC20 = await getDeployedContract("TBTC")
  const tbtcBridge: BridgeStub = await getDeployedContract("Bridge")
  const tbtcVault: TBTCVaultStub = await getDeployedContract("TBTCVault")

  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")

  const vault: TestERC4626 = await getDeployedContract("Vault")
  const mezoAllocator: MezoAllocator =
    await getDeployedContract("MezoAllocator")
  const mezoPortal: MezoPortalStub = await getDeployedContract("MezoPortal")

  return {
    tbtc,
    stbtc,
    bitcoinDepositor,
    tbtcBridge,
    tbtcVault,
    dispatcher,
    vault,
    mezoAllocator,
    mezoPortal,
  }
}
