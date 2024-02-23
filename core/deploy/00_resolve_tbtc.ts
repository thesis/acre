import type { HardhatRuntimeEnvironment } from "hardhat/types"
import type { DeployFunction } from "hardhat-deploy/types"
import { isNonZeroAddress } from "../helpers/address"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()

  // TODO: extract to a helper function
  let tBTC
  if (hre.network.name === "integration") {
    tBTC = await deployments.getArtifact("TBTC")
  } else {
    tBTC = await deployments.getOrNull("TBTC")
  }

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
