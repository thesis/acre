import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers, getNamedAccounts } = hre
  const { governance } = await getNamedAccounts()
  const { deployer } = await helpers.signers.getNamedSigners()

  const bridge = await deployments.get("Bridge")
  const tbtcVault = await deployments.get("TBTCVault")
  const tbtc = await deployments.get("TBTC")
  const stbtc = await deployments.get("stBTC")

  const [, acreBitcoinDepositorDeployment] = await helpers.upgrades.deployProxy(
    "AcreBitcoinDepositor",
    {
      contractName:
        process.env.HARDHAT_TEST === "true"
          ? "AcreBitcoinDepositorHarness"
          : "AcreBitcoinDepositor",
      factoryOpts: {
        signer: deployer,
      },
      initializerArgs: [
        bridge.address,
        tbtcVault.address,
        tbtc.address,
        stbtc.address,
      ],
      proxyOpts: {
        kind: "transparent",
        initialOwner: governance,
      },
    },
  )

  if (
    acreBitcoinDepositorDeployment.transactionHash &&
    hre.network.tags.etherscan
  ) {
    await waitForTransaction(
      hre,
      acreBitcoinDepositorDeployment.transactionHash,
    )
    await helpers.etherscan.verify(acreBitcoinDepositorDeployment)
  }

  // TODO: Add Tenderly verification
}

export default func

func.tags = ["AcreBitcoinDepositor"]
func.dependencies = ["TBTC", "stBTC"]
