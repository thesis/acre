import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { waitConfirmationsNumber } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const stbtc = await deployments.get("stBTC")

  await deployments.deploy("TestStakingFlow", {
    from: deployer,
    args: [stbtc.address],
    log: true,
    waitConfirmations: waitConfirmationsNumber(hre),
  })

  // if (hre.network.tags.etherscan) {
  //   await helpers.etherscan.verify(stbtc)
  // }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["StakingTest"]
func.dependencies = ["stBTC"]
