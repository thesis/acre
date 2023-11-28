# Acre

Bitcoin Liquid Staking

[![Core](https://github.com/thesis/acre/actions/workflows/core.yaml/badge.svg?branch=main&event=push)](https://github.com/thesis/acre/actions/workflows/core.yaml)

## Development

### Pre-commit Hooks

Developers are encouraged to use [pre-commit](https://pre-commit.com/) hooks to
automatically discover code issues, before they submit the code.

To setup the hooks follow the steps:

1. Install `pre-commit` tool:
    ```sh
    brew install pre-commit
    ```

2. Install the hooks for the repository:
    ```sh
    pre-commit install
    ```

#### Testing

To test the pre-commit hooks configuration you can invoke them with one of the
commands:
```sh
# Execute hooks for all files:
pre-commit run --all-files

# Execute hooks for specific files (e.g. Acre.sol):
pre-commit run --files ./core/contracts/Acre.sol
```

### Slither

[Slither](https://github.com/crytic/slither) is a static analysis framework used
for Solidity contracts verification.

#### Install

To install Slither execute:

```sh
pip3 install slither-analyzer
```

#### Usage

To run Slither execute:

```sh
slither .
```
