import type { DeployFunction } from "hardhat-deploy/types"
import type {
  HardhatNetworkConfig,
  HardhatRuntimeEnvironment,
} from "hardhat/types"
import { isNonZeroAddress } from "../helpers/address"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const tbtcVault = await deployments.getOrNull("TBTCVault")

  if (tbtcVault && isNonZeroAddress(tbtcVault.address)) {
    log(`using TBTCVault contract at ${tbtcVault.address}`)
  } else if (
    !hre.network.tags.allowStubs ||
    (hre.network.config as HardhatNetworkConfig)?.forking?.enabled
  ) {
    throw new Error("deployed TBTCVault contract not found")
  } else {
    log("deploying TBTCVault contract stub")

    const tbtc = await deployments.get("TBTC")
    const bridge = await deployments.get("Bridge")

    await deployments.deploy("TBTCVault", {
      contract: "TBTCVaultStub",
      args: [tbtc.address, bridge.address],
      from: deployer,
      log: true,
      waitConfirmations: 1,
    })
  }
}

export default func

func.tags = ["TBTC", "TBTCVault"]
func.dependencies = ["TBTCToken", "Bridge"]
