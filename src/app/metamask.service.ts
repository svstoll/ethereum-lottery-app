import {Inject, Injectable, OnInit} from '@angular/core';
import { WEB3 } from './web3';
import Web3 from 'web3';

@Injectable()
export class MetaMaskService {

  abi: any = [
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
    "name": "",
    "type": "address"
  },
  {
    "name": "",
    "type": "uint256"
  }
],
  "name": "tickets",
  "outputs": [
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
  "payable": false,
  "stateMutability": "view",
  "type": "function"
},
{
  "constant": true,
  "inputs": [],
  "name": "getWinners",
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
}
]


  constructor(@Inject(WEB3) private web3: Web3) {

  }

  init() {
    if ('enable' in this.web3.currentProvider) {
      this.web3.currentProvider.enable();
    }
  }

  getAccounts(): string[] {
    return this.web3.eth.accounts;
  }

  buyTicket(chosenNumber: number): string {
    const contract = this.web3.eth.contract(this.abi);
    const contractInstance = contract.at('0xbd06f829f5286a5af886957552b6643ec337af30');
    const transactionObject = {
      from: this.getAccounts()[0],
      gas: 3000000,
      value: 1000000000000000000
    };
    return contractInstance.setBet.sendTransaction(chosenNumber, transactionObject, (error, result) => {
      console.log(error);
      console.log(result);
    });
  }
}
