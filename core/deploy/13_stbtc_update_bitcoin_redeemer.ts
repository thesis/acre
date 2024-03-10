import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const bitcoinRedeemer = await deployments.get("BitcoinRedeemer")

  await deployments.execute(
    "stBTC",
    { from: deployer, log: true, waitConfirmations: 1 },
    "updateBitcoinRedeemer",
    bitcoinRedeemer.address,
  )
}

export default func

func.tags = ["AcreUpdateBitcoinRedeemer"]
func.dependencies = ["stBTC", "BitcoinRedeemer"]
