import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { fetchDeploymentArtifact } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const tBTC = await fetchDeploymentArtifact(hre, "TBTC")

  log("deploying Mock ERC4626 Vault")

  await deployments.deploy("SingleTokenVault", {
    from: deployer,
    args: [tBTC.address, "MockSingleTokenVault", "MSTV"],
    log: true,
    waitConfirmations: 1,
  })
}

export default func

func.tags = ["TestSingleTokenVault"]
func.dependencies = ["TBTC"]

func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
  Promise.resolve(hre.network.name === "mainnet")
