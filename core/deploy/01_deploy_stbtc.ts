import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { fetchDeploymentArtifact } from "../helpers/address"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, helpers } = hre
  const { deployer, treasury } = await getNamedAccounts()
  const { log } = deployments
  const rewardsCycleLength = 7 * 24 * 60 * 60 // 7 days TODO: revisit this value

  const tBTC = await fetchDeploymentArtifact(hre, "TBTC")

  log(`stBTC using TBTC contract at ${tBTC.address}`)

  const stbtc = await deployments.deploy("stBTC", {
    from: deployer,
    args: [tBTC.address, treasury, rewardsCycleLength],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  if (hre.network.tags.etherscan) {
    await helpers.etherscan.verify(stbtc)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["stBTC"]
func.dependencies = ["TBTC"]
