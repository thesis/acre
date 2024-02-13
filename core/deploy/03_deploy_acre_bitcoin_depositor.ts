import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const bridge = await deployments.get("Bridge")
  const tbtcVault = await deployments.get("TBTCVault")
  const tbtc = await deployments.get("TBTC")
  const stbtc = await deployments.get("stBTC")

  await deployments.deploy("AcreBitcoinDepositor", {
    contract:
      process.env.HARDHAT_TEST === "true"
        ? "AcreBitcoinDepositorHarness"
        : "AcreBitcoinDepositor",
    from: deployer,
    args: [bridge.address, tbtcVault.address, tbtc.address, stbtc.address],
    log: true,
    waitConfirmations: 1,
  })

  // TODO: Add Etherscan verification
  // TODO: Add Tenderly verification
}

export default func

func.tags = ["AcreBitcoinDepositor"]
func.dependencies = ["TBTC", "stBTC"]
