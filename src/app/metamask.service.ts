import {Inject, Injectable} from '@angular/core';
import { WEB3 } from './web3';
import Web3 from 'web3';
import {bindNodeCallback} from 'rxjs';

@Injectable()
export class MetaMaskService {

  ORACLE_ABI: any = [
    {
      constant: false,
      inputs: [
        {
          name: 'queryId',
          type: 'bytes32'
        },
        {
          name: 'result',
          type: 'string'
        }
      ],
      name: '__callback',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_myid',
          type: 'bytes32'
        },
        {
          name: '_result',
          type: 'string'
        },
        {
          name: '_proof',
          type: 'bytes'
        }
      ],
      name: '__callback',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_activateTestMode',
          type: 'bool'
        }
      ],
      name: 'activateTestMode',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'generateRandomNumber',
      outputs: [
        {
          name: '',
          type: 'bytes32'
        }
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: '',
          type: 'uint256'
        }
      ],
      name: 'Log',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'QuerySentEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'QueryNotSentEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'QueryFinishedEvent',
      type: 'event'
    },
    {
      constant: false,
      inputs: [],
      name: 'retrieveProfit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_newOwner',
          type: 'address'
        }
      ],
      name: 'transferOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      payable: true,
      stateMutability: 'payable',
      type: 'fallback'
    },
    {
      inputs: [],
      payable: true,
      stateMutability: 'payable',
      type: 'constructor'
    },
    {
      constant: true,
      inputs: [],
      name: 'getBalance',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'queryId',
          type: 'bytes32'
        }
      ],
      name: 'getRandomNumber',
      outputs: [
        {
          name: '',
          type: 'string'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'queryId',
          type: 'bytes32'
        }
      ],
      name: 'isQueryProcessed',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ];

  LOTTERY_ABI: any = [
    {
      constant: true,
      inputs: [],
      name: 'getCurrentRoundStart',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'checkWinnings',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'drawWinningNumbers',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'closeLottery',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getCurrentRoundEnd',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'endRound',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getRoundDuration',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getJackpot',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_roundStart',
          type: 'uint256'
        }
      ],
      name: 'getWinningNumbersForRoundStart',
      outputs: [
        {
          name: '',
          type: 'string'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: '_account',
          type: 'address'
        }
      ],
      name: 'getTicketsForAddress',
      outputs: [
        {
          components: [
            {
              name: 'chosenNumbers',
              type: 'string'
            },
            {
              name: 'roundStart',
              type: 'uint256'
            },
            {
              name: 'ticketOwner',
              type: 'address'
            }
          ],
          name: '',
          type: 'tuple[]'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'getTimeLeft',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_oracleFee',
          type: 'uint256'
        }
      ],
      name: 'adjustOracleFee',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_newOwner',
          type: 'address'
        }
      ],
      name: 'transferOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: '_chosenNumbers',
          type: 'string'
        }
      ],
      name: 'buyTicket',
      outputs: [],
      payable: true,
      stateMutability: 'payable',
      type: 'function'
    },
    {
      inputs: [
        {
          name: '_oracle',
          type: 'address'
        },
        {
          name: '_roundDuration',
          type: 'uint256'
        }
      ],
      payable: true,
      stateMutability: 'payable',
      type: 'constructor'
    },
    {
      payable: true,
      stateMutability: 'payable',
      type: 'fallback'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'RoundStartEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'ProvideOracleFeeEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'UnfinishedBatchProcessingEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'description',
          type: 'string'
        }
      ],
      name: 'PayoutEvent',
      type: 'event'
    }
  ];

  private oracleContract: any;
  private lotteryContract: any;

  public getCurrentRoundStart: any = bindNodeCallback(callback => this.lotteryContract.getCurrentRoundStart.call(callback));
  public getJackpot: any = bindNodeCallback(callback => this.lotteryContract.getJackpot.call(callback));
  public getWinnersForRound: any = bindNodeCallback((round, callback) => this.lotteryContract.getWinnersForRound.call(round, callback));
  public getWinningNumbersForRound: any = bindNodeCallback((round, callback) => this.lotteryContract.getWinningNumbersForRound.call(round, callback));
  public getTimeLeft: any = bindNodeCallback(callback => this.lotteryContract.getTimeLeft.call(callback));

  public drawWinningNumbers: any = bindNodeCallback((callback) => this.lotteryContract.drawWinningNumbers.call(callback));
  public checkWinnings: any = bindNodeCallback((callback =>
    this.lotteryContract.checkWinnings.call(callback)));
  public buyTicket: any = bindNodeCallback((chosenNumber, callback) =>
    this.lotteryContract.buyTicket.sendTransaction(chosenNumber, this.getTransactionObject(), callback));

  constructor(@Inject(WEB3) private web3: Web3) {
  }

  init() {
    if ('enable' in this.web3.currentProvider) {
      this.web3.currentProvider.enable();

      // TODO: Automatically assign correct address based on the network that is currently connected with MetaMask.
      // this.oracleContract = this.web3.eth.contract(this.ORACLE_ABI).at('0x8350c626176eecf8b24c741e9da1669880d85b1a');
      // this.lotteryContract = this.web3.eth.contract(this.LOTTERY_ABI).at('0x2a263815924c121ba948eacffaeb1b18f17ffb32');
      this.oracleContract = this.web3.eth.contract(this.ORACLE_ABI).at('0xCfEB869F69431e42cdB54A4F4f105C19C080A601');
      this.lotteryContract = this.web3.eth.contract(this.LOTTERY_ABI).at('0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B');

      // const event = this.lotteryContract.RoundStartEvent((error, result) => {
      //   if (!error) {
      //     console.log('EVENT ARRIVED!');
      //     console.log(result);
      //   } else {
      //     console.error(error);
      //   }
      // });
     }
  }

  getTransactionObject() {
    return {
      from: this.web3.eth.accounts[0],
      gas: 5000000,
      value: 20000000000000000
    };
  }
}
