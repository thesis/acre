import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const allocator = await deployments.get("Allocator")

  await deployments.execute(
    "Reserve",
    { from: deployer, log: true, waitConfirmations: 1 },
    "setAllocator",
    allocator.address,
  )
}

export default func

func.tags = ["AllocatorSetInReserve"]
func.dependencies = ["Allocator"]
