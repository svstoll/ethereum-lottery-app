import {Inject, Injectable} from '@angular/core';
import {WEB3} from './web3';
import Web3 from 'web3';
import {environment} from '../environments/environment';

@Injectable()
export class MetaMaskService {

  ORACLE_ABI: any = [
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
      inputs: [],
      name: 'retrieveProfit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
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
      inputs: [
        {
          name: '_testMode',
          type: 'bool'
        },
        {
          name: '_privateNetwork',
          type: 'bool'
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
          name: '_oracleFee',
          type: 'uint256'
        }
      ],
      name: 'CurrentOracleFeeEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: '_description',
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
          name: '_description',
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
          name: '_description',
          type: 'string'
        }
      ],
      name: 'QueryFinishedEvent',
      type: 'event'
    }
  ];

  LOTTERY_ABI: any = [
    {
      constant: true,
      inputs: [],
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
    },
    {
      constant: true,
      inputs: [],
      name: 'isWaitingForWinningNumbers',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
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
      constant: true,
      inputs: [],
      name: 'isForcedRoundEnd',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
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
      name: 'retrieveLeftOvers',
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
      name: 'hasDrawingFinished',
      outputs: [
        {
          name: '',
          type: 'bool'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'distributeWinnings',
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
      name: 'getTicketPrice',
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
      inputs: [],
      name: 'isLotteryClosed',
      outputs: [
        {
          name: '',
          type: 'bool'
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
      name: 'getCurrentParticipants',
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
      inputs: [],
      name: 'distributeRefunds',
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
          name: '_oracleAddress',
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
          name: '_description',
          type: 'string'
        }
      ],
      name: 'LotteryClosedEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_roundStart',
          type: 'uint256'
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
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_roundStart',
          type: 'uint256'
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
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_roundStart',
          type: 'uint256'
        }
      ],
      name: 'DrawingFinishedEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_roundStart',
          type: 'uint256'
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
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_to',
          type: 'address'
        }
      ],
      name: 'WinnerEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_to',
          type: 'address'
        }
      ],
      name: 'RefundEvent',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: '_description',
          type: 'string'
        },
        {
          indexed: true,
          name: '_roundStart',
          type: 'uint256'
        }
      ],
      name: 'ForcedRoundEndEvent',
      type: 'event'
    }
  ];

  public currentNetwork: string;
  public oracleContract: any;
  public lotteryContract: any;
  public ticketPrice = 1;

  constructor(@Inject(WEB3) private web3: Web3) {
  }

  async init() {
    this.currentNetwork = await this.web3.eth.net.getNetworkType();
    switch (this.currentNetwork) {
      case 'main':
        this.oracleContract = await new this.web3.eth.Contract(this.ORACLE_ABI, environment.mainOracleAddress);
        this.lotteryContract = await new this.web3.eth.Contract(this.LOTTERY_ABI, environment.mainLotteryAddress);
        break;
      case 'ropsten':
        this.oracleContract = await new this.web3.eth.Contract(this.ORACLE_ABI, environment.ropstenOracleAddress);
        this.lotteryContract = await new this.web3.eth.Contract(this.LOTTERY_ABI, environment.ropstenLotteryAddress);
        break;
      case 'private':
        this.oracleContract = await new this.web3.eth.Contract(this.ORACLE_ABI, environment.privateOracleAddress);
        this.lotteryContract = await new this.web3.eth.Contract(this.LOTTERY_ABI, environment.privateLotteryAddress);
        break;
    }
    this.ticketPrice = await this.lotteryContract.methods.getTicketPrice().call();
  }

  public async getCurrentAccount() {
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  }

  public async buyTicket(numbers: string) {
    const account = await this.getCurrentAccount();
    const transactionObj = await this.getTransactionObject(account, 5000000, this.ticketPrice);
    await this.lotteryContract.methods.buyTicket(numbers).send(transactionObj);
  }

  public async drawWinningNumbers() {
    const account = await this.getCurrentAccount();
    const transactionObj = await this.getTransactionObject(account, 5000000, 0);
    await this.lotteryContract.methods.drawWinningNumbers().send(transactionObj);
  }

  public async distributeWinnings() {
    const account = await this.getCurrentAccount();
    const transactionObj = await this.getTransactionObject(account, 5000000, 0);
    await this.lotteryContract.methods.distributeWinnings().send(transactionObj);
  }

  public async distributeRefunds() {
    const account = await this.getCurrentAccount();
    const transactionObj = await this.getTransactionObject(account, 5000000, 0);
    await this.lotteryContract.methods.distributeRefunds().send(transactionObj);
  }

  public async getTicketsForAddress() {
    const account = await this.getCurrentAccount();
    return await this.lotteryContract.methods.getTicketsForAddress(account).call();
  }

  async getTransactionObject(FROM: string, GAS: number, VALUE: number) {
    return {
      from: FROM,
      gas: GAS,
      value: VALUE
    };
  }
}
