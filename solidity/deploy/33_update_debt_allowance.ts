import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { governance } = await getNamedAccounts()
  const { log } = deployments

  const mezoPortal = await deployments.get("MezoPortal")

  const debtAllowance = 250000000000000000000n // 250 stBTC

  log(`updating debt allowance for ${mezoPortal.address}`)

  await deployments.execute(
    "stBTC",
    { from: governance, log: true, waitConfirmations: 1 },
    "updateDebtAllowance",
    mezoPortal.address,
    debtAllowance,
  )
}

export default func

func.tags = ["UpdateDebtAllowance"]
func.dependencies = ["TransferOwnershipStBTC", "UpgradeStBTC"]
func.runAtTheEnd = true
func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
  Promise.resolve(
    hre.network.name === "integration" || hre.network.name === "mainnet",
  )
