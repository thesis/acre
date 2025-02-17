import type { DeployFunction } from "hardhat-deploy/types"
import type { HardhatRuntimeEnvironment } from "hardhat/types"
import { waitForTransaction } from "../helpers/deployment"

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, helpers, getNamedAccounts } = hre
  const { governance } = await getNamedAccounts()
  const { deployer } = await helpers.signers.getNamedSigners()
  const { log } = deployments

  const mezoPortal = await deployments.get("MezoPortal")

  const initialSupportedAssets =
    // On Sepolia we set addresses to mocked ERC20 contracts used by Mezo Portal:
    // https://github.com/thesis/mezo-portal/tree/main/solidity/deployments/sepolia
    hre.network.name === "sepolia"
      ? [
          "0x39AB795D11FCC6CE1c340fbDc308cF1D42ca8f86", // Mocked SolvBTC
          "0x64d92C98793C4a55B9a88c2BB9E356650D0d83F5", // Mocked SolvBTC.BBN
        ]
      : [
          "0x7A56E1C57C7475CCf742a1832B028F0456652F97", // SolvBTC
          "0xd9D920AA40f578ab794426F5C90F6C731D159DEf", // SolvBTC.BBN
        ]

  let deployment = await deployments.getOrNull("AcreMultiAssetVault")
  if (deployment && helpers.address.isValid(deployment.address)) {
    log(`using AcreMultiAssetVault at ${deployment.address}`)
  } else {
    ;[, deployment] = await helpers.upgrades.deployProxy(
      "AcreMultiAssetVault",
      {
        contractName: "AcreMultiAssetVault",
        initializerArgs: [
          governance,
          mezoPortal.address,
          initialSupportedAssets,
        ],
        factoryOpts: { signer: deployer },
        proxyOpts: {
          kind: "transparent",
          initialOwner: governance,
        },
      },
    )

    if (deployment.transactionHash && hre.network.tags.etherscan) {
      await waitForTransaction(hre, deployment.transactionHash)
      await helpers.etherscan.verify(deployment)
    }

    // TODO: Add Tenderly verification
  }
}

export default func

func.tags = ["AcreMultiAssetVault"]
func.dependencies = ["MezoPortal"]
