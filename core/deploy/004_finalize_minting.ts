import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  await deployments.execute(
    "TestStakingFlow",
    { from: deployer, log: true, waitConfirmations: 1 },
    "finalizeMinting",
    "0x3a59434dbebf72537e6416444dd25ab88ebb3ec32cce8b69d5cbca37efc9fdfa",
  )
}

export default func

func.tags = ["finalizeMinting"]
func.dependencies = ["TestStakingFlow"]
