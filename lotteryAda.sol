/* feel free to do any changes!
    here are few things need to be updated:
    1.  payment function. Should we(manager) send enough money to the contract in advance? 
        I don't know what will happen if there is no enough balance.
    2.  how to start next round automatically?
    3.  Unfortunately, mapping cannot be cleared in solidity. So after the end, how can we clear all data?
*/
pragma solidity >=0.5.0;

/* Oralce contract
   receive exteranlly generated random number.
*/
contract OracleAda{
    address owner;

    uint16 private randomNum;
    event random();
    constructor() public{
        owner = msg.sender;
    }
    modifier onlyOwner{
        require(
            msg.sender == owner,
            "only owner can call");
        _;
    }
    // once this event is heard in API
    event randomQueryEvent();
    function randomquery() internal{
        emit randomQueryEvent();
    }
    // receive random number from external source
    function _callback(uint16 _randomNum) private{
        randomNum = _randomNum;
    }
    function getRandom() public view returns(uint16){
        return randomNum;
    }
}

/* Lottery Rule: pick 4 unique numbers from 0 - 9
    random number is generated exteranlly and logged into conrtact.
    The ticket with all numbers match the random number wins (no order). 
    Divide the prize money, if there are more than 1 winner.
*/
contract LotteryAda is OracleAda{
    uint private price;
    uint public prizepool;
    uint private prize;
    uint public EndTime;
    uint16 private randomNum;
    uint round;
    
    address payable[] public winners; 
    address manager; // set the manager address to our account address when everything is done.
   
    struct Bet{
        uint16 betNum;
        uint timestamp;
        address ticketOwner;
    }
    
    mapping (address =>Bet[]) public tickets;
    mapping (uint24 => address payable[]) ticketholders;
    

    event result(address payable[] winners, uint prizepool);
   
    modifier cost(){
        require(
            // ######## unit of money. 1 = 1e18    ##########
            msg.value == price,
            "Insufficient moneny or too much money sent"
            );
        _;
    }
    // I set a limit for the number of tickets a player can buy in one round. Can be deleted.
    modifier TicketLimit(){
        require(
            tickets[msg.sender].length<10,
            "Exceeding maximum number of tickets"
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
    modifier beforeEnd(){
        require(
            now< EndTime,
            "Current round is close.");
            _;
    }
    modifier afterEnd(){
        require(
            now >= EndTime,
            "Too early to call the end");
        _;
    }
    
    constructor(uint _Endtime, uint _price, uint _prizepool) public payable {
        EndTime = now+2 days;
        price = _price;
        prizepool = _prizepool;
        manager = msg.sender;
    }
    
    function setBet(uint16 _betNum) cost TicketLimit beforeEnd decreasingOrder(_betNum) public payable{

        Bet memory _bet = Bet({betNum:_betNum, timestamp:uint(now), ticketOwner:msg.sender});
        tickets[msg.sender].push(_bet);
       
       
        /* player is not unique in the array "ticketholders", 
            i think to check if msg.sender exists is expensive as well
            so I just leave it here. I hope you have better ideas.
            
            But I think it is OK.
            The logic is: We have 2 winner, A has 2 winning bets, B has 1 wining bet. 
            Then A gets 2/3 of prizepool, B gets 1/3.
        */
        ticketholders[_betNum].push(msg.sender);
    }
    
    
    // get random number
    function generateRandom() onlyManager afterEnd private{
        // query function in Oracle
        randomquery();
        randomNum = getRandom();
        
    }
  
    function win() afterEnd onlyManager private {
        winners = ticketholders[randomNum];
        emit result(winners,prizepool);
        
    }
    
    // pay prize to each winner
    function pay() afterEnd onlyManager public payable{
        prize = prizepool/winners.length;
        for(uint i=0;i<winners.length;i++){
            winners[i].transfer(prize);
        }

    }
    

}