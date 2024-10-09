import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()
  const { log } = deployments

  // SolvBTC token address
  const solvBtcTokenAddress = "0x7A56E1C57C7475CCf742a1832B028F0456652F97"
  // SolvBTC.BBN token address
  const solvBtcBbnTokenAddress = "0xd9D920AA40f578ab794426F5C90F6C731D159DEf"

  log(`adding ${solvBtcTokenAddress} as asset supported by MultiAssetVault`)
  await deployments.execute(
    "MultiAssetVault",
    { from: deployer, log: true, waitConfirmations: 1 },
    "addSupportedAsset",
    solvBtcTokenAddress,
  )

  log(`adding ${solvBtcBbnTokenAddress} as asset supported by MultiAssetVault`)
  await deployments.execute(
    "MultiAssetVault",
    { from: deployer, log: true, waitConfirmations: 1 },
    "addSupportedAsset",
    solvBtcBbnTokenAddress,
  )
}

export default func

func.tags = ["MultiAssetVaultRegisterSolvBTC"]
func.dependencies = ["MultiAssetVault"]
// TODO: Uncomment after contracts are deployed to mainnet.
// func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
//   Promise.resolve(hre.network.name === "integration")
