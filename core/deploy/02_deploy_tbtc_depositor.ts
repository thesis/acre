import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const bridge = await deployments.get("Bridge")
  const tbtcVault = await deployments.get("TBTCVault")
  const acre = await deployments.get("Acre")

  await deployments.deploy("TbtcDepositor", {
    from: deployer,
    args: [bridge.address, tbtcVault.address, acre.address],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["TbtcDepositor"]
func.dependencies = ["TBTC", "Acre"]
