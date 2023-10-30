import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { helpers, deployments } = hre
  const { log } = deployments

  log("Deploying Litmus contract")
}

export default func

func.tags = ["Litmus"]
