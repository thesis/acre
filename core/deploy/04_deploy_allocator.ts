import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  // TODO: extract to a helper function
  let tBTC
  if (hre.network.name === "integration") {
    tBTC = await deployments.getArtifact("TBTC")
  } else {
    tBTC = await deployments.getOrNull("TBTC")
  }
  const stBTC = await deployments.get("stBTC")
  const reserve = await deployments.get("Reserve")

  await deployments.deploy("Allocator", {
    from: deployer,
    args: [tBTC.address, stBTC.address, reserve.address],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Allocator"]
func.dependencies = ["TBTC", "stBTC", "Reserve"]
