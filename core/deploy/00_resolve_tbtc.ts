import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { isNonZeroAddress, fetchDeploymentArtifact } from "../helpers/address"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  const tBTC = await fetchDeploymentArtifact(hre, "TBTC")

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (tBTC && isNonZeroAddress(tBTC.address)) {
    log(`using TBTC contract at ${tBTC.address}`)
  } else if (!hre.network.tags.allowStubs) {
    throw new Error("deployed TBTC contract not found")
  } else {
    log("deploying TBTC contract stub")

    await deployments.deploy("TBTC", {
      contract: "TestERC20",
      from: deployer,
      log: true,
      waitConfirmations: 1,
    })
  }
}

export default func

func.tags = ["TBTC"]
func.skip = async (hre: HardhatRuntimeEnvironment): Promise<boolean> =>
  Promise.resolve(hre.network.name === "mainnet")
