import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const stbtc = await deployments.get("stBTC")

  await deployments.execute(
    "MezoAllocator",
    {
      from: deployer,
      log: true,
      waitConfirmations: waitConfirmationsNumber(hre),
    },
    "updateTbtcStorage",
    stbtc.address,
  )
}

export default func

func.tags = ["MezoAllocatorUpdateStorage"]
func.dependencies = ["stBTC"]
