import {Inject, Injectable, OnInit} from '@angular/core';
import { WEB3 } from './web3';
import Web3 from 'web3';

@Injectable()
export class MetaMaskService {

  abi: any = [
    {
      "constant": true,
      "inputs": [],
      "name": "message",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function",
      "signature": "0xe21f37ce"
    },
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor",
      "signature": "constructor"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "GetMessage",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function",
      "signature": "0x03e33b53"
    }
  ];


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

  getHelloWorld(account: string): string {
    const contract = this.web3.eth.contract(this.abi);
    const contractInstance = contract.at('0xac3832C2C27f3Fb8C48a4C7e861031Dd2Db0fDbf');
    const transactionObject = {
      from: account,
      gas: 100000
    };
    return contractInstance.GetMessage.call(transactionObject, (error, result) => {
      console.log(error);
      console.log(result);
    });
  }
}
