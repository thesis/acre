#! /bin/bash
set -eou pipefail

ROOT_DIR=$(
    cd "$(dirname $0)/../"
    pwd -P
)
TMP_DIR=${ROOT_DIR}/tmp/external-artifacts
EXTERNAL_ARTIFACTS_DIR=${ROOT_DIR}/external

# Prepare temporary directory for NPM packages.
rm -rf ${TMP_DIR}
mkdir -p ${TMP_DIR}

# fetch_external_artifact is a function that fetches a contract deployment
# artifact from a package published to the NPM registry. It assumes a package is
# published following the rules established by Keep Network deployments:
# 1. Packages are tagged with network name and contain the latest version of
#    deployment artifacts for the given network.
# 2. Deployment artfiacts files located under `artifacts/` directory.
# 3. Deployment artifacts are JSON files with a file name corresponding to the
#    contract deployment name.
fetch_external_artifact() {
    # Tag used for the package.
    network=$1
    # Package name.
    package=$2
    # Name of the deployment artifact file.
    contractName=$3
    # Destination directory to save the extracted artifact.
    destination_dir=${EXTERNAL_ARTIFACTS_DIR}/${network}

    # Resolve a package ID for package and network tag.
    package=$(npm view ${package}@${network} _id)

    # Download compressed NPM package to a temporary directory.
    npm pack --silent \
        --pack-destination=${TMP_DIR} \
        ${package} |
        # Extract deployment artifact to the destination directory.
        xargs -I{} tar -zxf ${TMP_DIR}/{} -C ${destination_dir} \
            --strip-components 2 package/artifacts/${contractName}.json

    printf "Succesfully fetched ${contractName} contract artifact from ${package} to ${destination_dir}\n"
}

# Fetch TBTC contract from @keep-network/tbtc-v2 package.
fetch_external_artifact "mainnet" "@keep-network/tbtc-v2" "TBTC"
fetch_external_artifact "sepolia" "@keep-network/tbtc-v2" "TBTC"

# Remove downloaded NPM packages.
rm -rf ${TMP_DIR}
