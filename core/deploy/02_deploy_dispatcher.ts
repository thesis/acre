import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { fetchDeploymentArtifact } from "../helpers/address"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const tBTC = await fetchDeploymentArtifact(hre, "TBTC")
  const stbtc = await deployments.get("stBTC")

  await deployments.deploy("Dispatcher", {
    from: deployer,
    args: [stbtc.address, tBTC.address],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Dispatcher"]
func.dependencies = ["stBTC"]
