import { deployments } from "hardhat"
import { getDeployedContract } from "./contract"

import type {
  StBTC as stBTC,
  Dispatcher,
  BridgeStub,
  TestERC4626,
  TBTCVaultStub,
  BitcoinDepositor,
  BitcoinRedeemer,
  TestTBTC,
} from "../../typechain"

// eslint-disable-next-line import/prefer-default-export
export async function deployment() {
  await deployments.fixture()

  const stbtc: stBTC = await getDeployedContract("stBTC")
  const bitcoinDepositor: BitcoinDepositor =
    await getDeployedContract("BitcoinDepositor")
  const bitcoinRedeemer: BitcoinRedeemer =
    await getDeployedContract("BitcoinRedeemer")

  const tbtc: TestTBTC = await getDeployedContract("TBTC")
  const tbtcBridge: BridgeStub = await getDeployedContract("Bridge")
  const tbtcVault: TBTCVaultStub = await getDeployedContract("TBTCVault")

  const dispatcher: Dispatcher = await getDeployedContract("Dispatcher")

  const vault: TestERC4626 = await getDeployedContract("Vault")

  return {
    tbtc,
    stbtc,
    bitcoinDepositor,
    bitcoinRedeemer,
    tbtcBridge,
    tbtcVault,
    dispatcher,
    vault,
  }
}
