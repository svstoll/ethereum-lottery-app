import {Inject, Injectable} from '@angular/core';
import { WEB3 } from './web3';
import Web3 from 'web3';
import {bindNodeCallback} from 'rxjs';
import {bind} from '@angular/core/src/render3';

@Injectable()
export class MetaMaskService {

  abi: any = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_betNum",
          "type": "uint16"
        }
      ],
      "name": "setBet",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "startLottery",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "_price",
          "type": "uint256"
        }
      ],
      "payable": true,
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "winners",
          "type": "address[]"
        },
        {
          "indexed": false,
          "name": "prizepool",
          "type": "uint256"
        }
      ],
      "name": "result",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "random",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "randomQueryEvent",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getCurrentRound",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getPricePool",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getRandom",
      "outputs": [
        {
          "name": "",
          "type": "uint16"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_account",
          "type": "address"
        }
      ],
      "name": "getTicketsForAddress",
      "outputs": [
        {
          "components": [
            {
              "name": "betNum",
              "type": "uint16"
            },
            {
              "name": "round",
              "type": "uint256"
            },
            {
              "name": "ticketOwner",
              "type": "address"
            }
          ],
          "name": "",
          "type": "tuple[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getWinnersForRound",
      "outputs": [
        {
          "name": "",
          "type": "address[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getWinningNumberForRound",
      "outputs": [
        {
          "name": "",
          "type": "uint16"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

  contract: any;
  getCurrentRound: any = bindNodeCallback(callback => this.contract.getCurrentRound.call(callback));
  getPricePool: any = bindNodeCallback(callback => this.contract.getPricePool.call(callback));
  getWinnersForRound: any = bindNodeCallback((round, callback) => this.contract.getWinnersForRound.call(round, callback));
  getWinningNumberForRound: any = bindNodeCallback((round, callback) => this.contract.getWinningNumberForRound.call(round, callback));
  buyTicket: any = bindNodeCallback((chosenNumber, callback) => this.contract.setBet.sendTransaction(chosenNumber,
    this.getTransactionObject(), callback));

  constructor(@Inject(WEB3) private web3: Web3) {

  }

  init() {
    if ('enable' in this.web3.currentProvider) {
      this.web3.currentProvider.enable();
      this.contract = this.web3.eth.contract(this.abi).at('0x5624d3a1bc28c92aff508a005edc64f901f14c74');
      console.log(this.contract);
    }
  }

  getAccounts(): string[] {
    return this.web3.eth.accounts;
  }

  getTransactionObject() {
    return {
      from: this.getAccounts()[0],
      gas: 500000,
      value: 1000000000000000000
    };
  }



}
