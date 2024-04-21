# Acre staking subgraph

This repository contains Acre staking subgraphs. Subgraphs are open APIs to
query data from networks like Ethereum and IPFS. The data is indexed by [The
Graph](https://thegraph.com/) decentralized protocol.

By the moment, there one subgraph have been developed:

- sepolia: collects the data from contracts in Sepolia Testnet.

## Development

### Installation

1. Install the Graph CLI in your computer:

   ```
   yarn global add @graphprotocol/graph-cli
   ```

2. Once graph-cli is installed in your system, install dependencies, linting and
   formatting tools:

   ```
   pnpm install
   ```

3. Build the subgraph:

   ```
   pnpm codegen && pnpm build
   ```

### Deploy the subgraph locally

In order to index a network, Graph Node needs access to a network client via an
EVM-compatible JSON-RPC API. You can use Thesis private RPC from Alchemy or
create a private one
[here](https://www.alchemy.com/overviews/private-rpc-endpoint).

1. Install Docker on your local machine:

   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. Set the API key in the `docker-compose.yaml` file.

   ```
   ethereum: "sepolia:https://eth-sepolia.g.alchemy.com/v2/<API key>"
   ```

3. Run a local Graph Node:

   ```
   docker-compose up
   ```

4. Allocate the subgraph name in the local Graph Node:

   ```
   pnpm create-local
   ```

Note: use it only if your subgraph is not created in the local Graph node.

5. Deploy the subgraph to your local Graph Node:

   ```
   pnpm deploy-local
   ```

6. Create Subgraph queries and preview of the entities:

   ```
   http://localhost:8000/subgraphs/name/acre-subgraph
   ```

### Deploy the subgraph to Subgraph Studio

1. Once your subgraph has been created in Subgraph Studio you can initialize the subgraph code using this command:

   ```
      graph init --studio <SUBGRAPH_SLUG>
   ```

   The <SUBGRAPH_SLUG> value can be found on your subgraph details page in Subgraph Studio
   (https://thegraph.com/docs/en/deploying/deploying-a-subgraph-to-studio/#create-your-subgraph-in-subgraph-studio)

2. Before being able to deploy your subgraph to Subgraph Studio, you need to login into your account within the CLI.

   ```
      graph auth --studio <DEPLOY KEY>
   ```

   The <SUBGRAPH_SLUG> can be found on your "My Subgraphs" page or your subgraph details page.

3. Deploying a Subgraph to Subgraph Studio

   ```
   graph deploy --studio <SUBGRAPH_SLUG>
   ```

   After running this command, the CLI will ask for a version label, you can name it however you want, you can use labels such as 0.1 and 0.2 or use letters as well such as uniswap-v2-0.1.
