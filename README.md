# Ethereum Lottery DApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.8.

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Smart Contract Deployment

The smart contracts used by this DApp are stored in `ethereum\contracts`. You can use use [Ganache](https://truffleframework.com/ganache), 
[Truffle](https://truffleframework.com/truffle) and [Oraclize Bridge](https://github.com/oraclize/ethereum-bridge) to deploy these contracts
to a local Ethereum blockchain. After deploying the contracts, you need to insert their addresses in `src\environments\environments.ts`. 

Alternatively, you can use the DApp with the Ropsten test network on which the contracts have already been deployed.
