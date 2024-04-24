import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()

  const minimumDepositAmount = 150000000000000 // 0.00015 tBTC

  await deployments.execute(
    "BitcoinDepositor",
    { from: deployer, log: true, waitConfirmations: 1 },
    "updateMinDepositAmount",
    minimumDepositAmount,
  )
}

export default func

func.tags = ["BitcoinDepositorUpdateMinimumDepositAmount"]
func.dependencies = ["BitcoinDepositor"]

// Run only on Sepolia testnet.
func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
  Promise.resolve(hre.network.name !== "sepolia")
