import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer, treasury } = await getNamedAccounts()

  const tbtc = await deployments.get("TBTC")
  const rewardsCycleLength = 7 * 24 * 60 * 60 // 7 days

  await deployments.deploy("stBTC", {
    from: deployer,
    args: [tbtc.address, treasury, rewardsCycleLength],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["stBTC"]
func.dependencies = ["TBTC"]
