import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { deployer } = await getNamedAccounts()

  const tbtc = await deployments.get("TBTC")
  const mezoPortal = await deployments.get("MezoPortal")

  const mezoAllocator = await deployments.deploy("MezoAllocator", {
    from: deployer,
    args: [mezoPortal.address, tbtc.address],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  if (hre.network.tags.etherscan) {
    await helpers.etherscan.verify(mezoAllocator)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["MezoAllocator"]
func.dependencies = ["TBTC"]
