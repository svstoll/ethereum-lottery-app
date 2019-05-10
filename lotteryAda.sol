/* feel free to do any changes!
    here are few things need to be updated:
    1.  payment function. Should we(manager) send enough money to the contract in advance?
        I don't know what will happen if there is no enough balance.
    2.  how to start next round automatically?
    3.  Unfortunately, mapping cannot be cleared in solidity. So after the end, how can we clear all data?
*/
/* Update Roger:
    1. Introduced rounds: The lottery is able to manage rounds now. After a lottery "cycle" has finished another round starts automatically
        I did it with a mappig from rounds to betting numbers to ticketholders
    2. Automatic Payout after starting the lottery through the manager: When the manager starts the lottery, a random number gets
        drawn, the winners are assigned and the pricepool is paid out.
    3. The pricepool is acummulated with the price the players pay for a ticket. If somebody wins, the pricepool is paid out and set to 0.
    
*/

/* Updated by Fan:
    1. Gain random number from random.org repetitively: please wait for about 40 secs after the query transaction being confirmed;
    2. Add weiTrans function to cover the query fee in case that the balance of contract is not enough;
    3. For oracle query, it is free for the first time, but it will charge query fee from the seond time. 
       Since each query is expensive (~0.001 ether), maybe deducting it from pricepool for each round is reasonable.
*/


pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract OracleAda is usingOraclize {
    uint16 public randomNumber;
    address owner;
    uint public OFee; // oracle query fee + transaction fee, which is about 863300000000000 wei
    uint public CBalance; // contract balance, should be larger than OFee to query a random number

    event contractBalance(string description);

    constructor() payable public {
        oraclize_setCustomGasPrice(4000000000 wei); // modify the default GasPrice from 20 Gwei to 4Gwei;
        owner = msg.sender;
    } 
    function () payable external { } //contract payable fallback function to accept ether

    function weiTrans(uint payValue) payable public {
        address(this).transfer(payValue);
        CBalance = address(this).balance;
        
    } 

    function __callback(bytes32 queryId, string memory result, bytes memory proof) public {
        require(msg.sender == oraclize_cbAddress());
        randomNumber = uint16(parseInt(result));
    }
    
    function getRandomNumber() payable public {
    
        string memory query = "https://www.random.org/integers/?num=1&min=1000&max=9999&col=1&base=10&format=plain&rnd=new";
     // generate one uint16 type random number between 1000 to 9999, which is a 4-digit integer; other alternatives are shown below, 
     // but pay attention to different data types 
     // https://www.random.org/integer-sets/?sets=1&num=4&min=0&max=9&seqnos=on&commas=on&sort=on&order=index&format=plain&rnd=new";
     // https://www.random.org/sequences/?min=0&max=9&col=5&format=plain&rnd=new";
	     
        OFee = oraclize_getPrice("URL");
        CBalance = address(this).balance;
        if (OFee < CBalance) {
            emit contractBalance("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", query);
        }
        else {
            emit contractBalance("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
            weiTrans(900000000000000); //transfer wei to the contract automatically
            emit contractBalance("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", query);
        }        
        
    }
    
    function generateRnd() payable public returns(uint16) {
        getRandomNumber();
        return randomNumber;// after calling the function is confirmed, wait for about 1 min to see the randomNumber
    }
 
 
}
/* Lottery Rule: pick 4 unique numbers from 0 - 9
    random number is generated exteranlly and logged into conrtact.
    The ticket with all numbers match the random number wins (no order).
    Divide the prize money, if there are more than 1 winner.
*/
contract LotteryAda is OracleAda{
    uint private price;
    uint private pricePool;
    uint private round;

    address manager; // set the manager address to our account address when everything is done.
    event randomQueryEvent();
    event random();
    function randomquery() internal{
        emit randomQueryEvent();
    }
    struct Bet{
        uint16 betNum;
        uint round;
        address ticketOwner;
    }

    mapping (address =>Bet[]) tickets;
    mapping (uint => mapping(uint24 => address payable[])) ticketholdersInRounds;
    mapping (uint => address payable[]) private winnersInRounds;
    mapping (uint => uint16) randomNumbersInRounds;


    event result(address payable[] winners, uint prizepool);

    modifier cost(){
        require(
            // ######## unit of money. 1 = 1e18    ##########
            msg.value == price,
            "Insufficient moneny or too much money sent"
            );
        _;
    }

    // manager call the end and draw randomNum.
    modifier onlyManager(){
        require(msg.sender == manager);
        _;
    }
    // require bet number to have an decreasing order. eg: 009876 (uint16 is 6-digit).
    // make winner checking process much easier.
    modifier decreasingOrder(uint16 num){
        require((num%10000)/1000 > (num%1000)/100 &&
                (num%1000)/100 > (num%100)/10 &&
                (num%100)/10 > num%10,
                "Follow the required order of input");
                _;
    }

    // To check the winner accounts for a given round
    function getWinnersForRound(uint _round) public view returns (address payable[] memory) {
        return winnersInRounds[_round];
    }

    // to get the current round
    function getCurrentRound() public view returns (uint) {
        return round;
    }

    // to get the pricepool
    function getPricePool() public view returns (uint) {
        
        return pricePool;
    }

    // Show the Bet Objects for a given address
    function getTicketsForAddress(address _account) public view returns (Bet[] memory) {
        return tickets[_account];
    }

    function getWinningNumberForRound(uint _round) public view returns (uint16) {
        return randomNumbersInRounds[_round];
    }

    constructor(uint _price) public payable {
        price = _price;
        manager = msg.sender;
        pricePool = 0;
        round = 0;
    }

    function setBet(uint16 _betNum) cost decreasingOrder(_betNum) public payable{
        
        Bet memory _bet = Bet({betNum:_betNum, round: round, ticketOwner:msg.sender});
        tickets[msg.sender].push(_bet);


        /* player is not unique in the array "ticketholders",
            i think to check if msg.sender exists is expensive as well
            so I just leave it here. I hope you have better ideas.

            But I think it is OK.
            The logic is: We have 2 winner, A has 2 winning bets, B has 1 wining bet.
            Then A gets 2/3 of prizepool, B gets 1/3.
        */
        // Use this mapping to get easily the tickets to payout the winners
        ticketholdersInRounds[round][_betNum].push(msg.sender);
        // update prizepool
        pricePool += msg.value;
    }
    // roughly 2000000 gwei fo value is required
    function startLottery() onlyManager public payable {
        setRandomNumber();
        setWinners();
        pay();
        // go to the next round
        round++;
    }


    // get random number      
    function setRandomNumber() onlyManager public {
        // query function in Oracle
        /*
        I don't get how the oracle works so i just take a fixed number for testing
        */

        randomquery();
        randomNumbersInRounds[round] = generateRnd();

        //randomNumbersInRounds[round] = 6543;

    }
    
    
   // onlyManager
    function setWinners() onlyManager public {
        winnersInRounds[round] = ticketholdersInRounds[round][randomNumbersInRounds[round]];
    }

    // pay prize to each winner 
    function pay() onlyManager public {
        if(winnersInRounds[round].length != 0) {
            uint priceToWinner = pricePool/winnersInRounds[round].length;
            for(uint i=0;i<winnersInRounds[round].length;i++){
                winnersInRounds[round][i].transfer(priceToWinner);
            }
            pricePool = 0;
        }
    }


}
