import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const performanceFeeRatio = 1_000n // 10%
  const withdrawFeeRatio = 0n // 0%
  await deployments.deploy("Reserve", {
    from: deployer,
    args: [performanceFeeRatio, withdrawFeeRatio],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["Reserve"]
func.dependencies = ["stBTC"]
