# Acre Contracts

Acre protocol smart contracts.

[![Solidity](https://github.com/thesis/acre/actions/workflows/solidity.yaml/badge.svg?branch=main&event=push)](https://github.com/thesis/acre/actions/workflows/solidity.yaml)

## Development

### Installation

This project uses [pnpm](https://pnpm.io/) as a package manager ([installation documentation](https://pnpm.io/installation)).

To install the dependencies execute:

```bash
pnpm install
```

### Testing

To run the test execute:

```
$ pnpm test
```

### Integration testing

To run the integration tests follow these steps:

- Run the Hardhat Node locally forking Mainnet at block `19680873`:

```
$ npx hardhat node --no-deploy --fork https://eth-mainnet.g.alchemy.com/v2/<key> --fork-block-number 19680873
```

- Once the local node is running you can execute the integration tests:

```
$ pnpm test:integration
```

### Deploying

We deploy our contracts with
[hardhat-deploy](https://www.npmjs.com/package/hardhat-deploy) via

```
$ pnpm run deploy [--network <network>]
```

Check the `"networks"` entry of `hardhat.config.ts` for supported networks.

## Contract Addresses

The official mainnet and testnet contract addresses are listed below.

### Mainnet

TBD

### Sepolia

TBD
