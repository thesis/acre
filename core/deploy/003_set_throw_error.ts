import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  await deployments.execute(
    "TestStakingFlow",
    { from: deployer, log: true, waitConfirmations: 1 },
    "setShouldRevertStaking",
    true,
  )
}

export default func

func.tags = ["setThrowError"]
func.dependencies = ["TestStakingFlow"]
