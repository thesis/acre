import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, maintainer } = await getNamedAccounts()

  await deployments.execute(
    "Dispatcher",
    { from: deployer, log: true, waitConfirmations: 1 },
    "updateMaintainer",
    maintainer,
  )
}

export default func

func.tags = ["UpdateMaintainer"]
func.dependencies = ["Dispatcher"]
