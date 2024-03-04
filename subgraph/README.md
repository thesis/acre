# Acre staking subgraph

This repository contains Acre staking subgraphs. Subgraphs are open APIs to query data from networks like Ethereum and IPFS. The data is indexed by [The Graph](https://thegraph.com/) decentralized protocol.

By the moment, there one subgraph have been developed:

- sepolia: collects the data from contracts in Sepolia Testnet.

## Development

### Installation

1. Install the Graph CLI in your computer:

   ```
   yarn global add @graphprotocol/graph-cli
   ```

2. Once graph-cli is installed in your system, install dependencies, linting and formatting
   tools:

   ```
   pnpm install
   ```

3. Build the subgraph:

   ```
   pnpm codegen && pnpm build
   ```

### Deploy the subgraph locally

In order to index a network, Graph Node needs access to a network client via an EVM-compatible JSON-RPC API. If you don't already have your own private RPC, you can create one [here](https://www.alchemy.com/overviews/private-rpc-endpoint).

1. Set your API key in the `docker-compose.yaml` file.

   ```
   ethereum: "sepolia:https://eth-sepolia.g.alchemy.com/<your API key>"
   ```

2. Run a local Graph Node:

   ```
   docker-compose up
   ```

3. Allocate the subgraph name in the local Graph Node:

   ```
   pnpm create-local
   ```

Note: use it only if your subgraph is not created in the local Graph node.

4. Deploy the subgraph to your local Graph Node:

   ```
   pnpm deploy-local
   ```
