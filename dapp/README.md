# Acre dApp

The application is compatible with Ledger Live and allows people to earn yield on their Bitcoin via yield farming on Ethereum.

This project was bootstrapped with [Create Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite).

To access the dApp in Ledger Live import manifest as described in the
[Ledger Live Setup](#ledger-live-setup) section.

### Development

Install dependencies and start the dApp:

 ```bash
    pnpm install
    pnpm run start
```

### Ledger Live Setup

To access the Acre dApp in Ledger Live Desktop you need to open the Ledger Live in
the _Developer mode_ and import the manifest. Please follow the instructions below.


1. [Install Ledger Live Desktop](https://www.ledger.com/ledger-live)

2. Enable the _Developer mode_
   
    Go to the **Settings -> About** section, and click **10 times** on the Ledger
    Live version.
    A new Developer section appears in the settings menu.
    Turn on **Enable platform dev** tools to use the developer tools window to
    inspect your app.

3. Add your manifest
    
    Click on Browse next to **Add a local app** and select the manifest file:
    - for _development_ environment: [ledger-manifest-development.json](ledger-manifest-development.json)
    - for _testnet_ environment: [ledger-manifest-testnet.json](ledger-manifest-testnet.json)
    
    The app is now visible in the menu.

If you have any problems, take a look [here](https://developers.ledger.com/APIs/wallet-api/examples/use-live-app/import).
