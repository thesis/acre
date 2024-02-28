import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import {
  fetchDeploymentArtifact,
  waitConfirmationsNumber,
} from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { deployer } = await getNamedAccounts()

  const tBTC = await fetchDeploymentArtifact(hre, "TBTC")
  const stBTC = await deployments.get("stBTC")
  const reserve = await deployments.get("Reserve")

  const allocator = await deployments.deploy("Allocator", {
    from: deployer,
    args: [tBTC.address, stBTC.address, reserve.address],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  if (hre.network.tags.etherscan) {
    await helpers.etherscan.verify(allocator)
  }
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Allocator"]
func.dependencies = ["TBTC", "stBTC", "Reserve"]
