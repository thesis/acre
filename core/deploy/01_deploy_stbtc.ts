import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, treasury } = await getNamedAccounts()
  const { log } = deployments
  const rewardsCycleLength = 7 * 24 * 60 * 60 // 7 days TODO: revisit this value

  // TODO: extract to a helper function
  let tBTC
  if (hre.network.name === "integration") {
    tBTC = await deployments.getArtifact("TBTC")
  } else {
    tBTC = await deployments.getOrNull("TBTC")
  }

  log(`stBTC using TBTC contract at ${tBTC.address}`)

  await deployments.deploy("stBTC", {
    from: deployer,
    args: [tBTC.address, treasury, rewardsCycleLength],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["stBTC"]
func.dependencies = ["TBTC"]
