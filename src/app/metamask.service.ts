import { Injectable } from '@angular/core';

declare var Web3: any;
declare var ethereum: any;

@Injectable()
export class MetaMaskService {
  private helloWorldContractAbi: any = [
    {
      inputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
      signature: 'constructor'
    },
    {
      constant: true,
      inputs: [],
      name: 'hi',
      outputs: [
        {
          name: '',
          type: 'string'
        }
      ],
      payable: false,
      stateMutability: 'pure',
      type: 'function',
      signature: '0xa99dca3f'
    }
  ];

  public init() {}

  public async getBalance() {
    try {
      await ethereum.enable();
      const web3 = new Web3(ethereum);

      await web3.eth.getBalance(web3.eth.accounts[0], (error: any, balance: any) => {
        if (error) {
          console.log(error);
        }
        const ether = web3.fromWei(balance, 'ether');
        console.log(ether.toString());
      });

      const helloContract: any = web3.eth.contract(this.helloWorldContractAbi);
      const contract: any = helloContract.at('0xd3e8a6d8b90c1d1cb82374935691cc9d5054aa9f');

      await contract.hi((error, value) => {
        console.log(value);
      });
    } catch (error) {
      console.log(error);
    }
  }
}
