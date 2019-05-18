pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

import "./OracleAda.sol";

contract LotteryAda {

    struct Ticket {
        string chosenNumbers;
        uint roundStart;
        address ticketOwner;
    }

    event LotteryClosedEvent(string _description);
    event RoundStartEvent(string _description, uint indexed _roundStart);
    event ProvideOracleFeeEvent(string _description, uint indexed _roundStart);
    event DrawingFinishedEvent(string _description, uint indexed _roundStart);
    event UnfinishedBatchProcessingEvent(string _description, uint indexed _roundStart);
    event PayoutEvent(string _description, address payable indexed _to);
    event ForcedRoundEndEvent(string _description, uint indexed _roundStart);

    address private owner;
    uint private batchSize = 1;

    OracleAda private oracle;
    address payable private oracleAddress;
    uint private oracleFee = 5000000000000000 wei;
    bytes32 private lastOracleQueryId;
    uint private failedOracleAttempts = 0;

    uint private price = 0.02 ether;
    uint private jackpot = 0;

    uint private roundStart;
    uint private roundDuration;
    bool private forcedRoundEnd = false;
    uint private currentParticipants;
    bool private waitingForWinningNumbers;
    bool private drawingFinished = false;
    uint private processedWinners = 0;
    mapping(address => Ticket[]) private ticketsByAddress;
    mapping(address => uint) private winningsByAddress;
    mapping(uint => mapping(string => address payable[])) private addressByChosenNumbersByRoundStart;
    mapping(uint => string) private winningNumbersByRoundStart;

    bool private lotteryClosed = false;
    address payable[] private refundableTicketHolders;
    uint private processedRefunds = 0;
    mapping(address => uint) private refundsByAddress;

    constructor(address payable _oracle, uint _roundDuration) public payable {
        owner = msg.sender;
        oracle = OracleAda(_oracle);
        oracleAddress = _oracle;
        roundDuration = _roundDuration;
        roundStart = now;
    }

    function() external payable {
        // Fallback 'payable' function is needed for a contract to  accept ETH payments.
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Function can only be executed by contract owner.");
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    function adjustOracleFee(uint _oracleFee) public onlyOwner {
        oracleFee = _oracleFee;
    }

    function endRound() public onlyOwner {
        forcedRoundEnd = true;
        emit ForcedRoundEndEvent("Current round was ended by contract owner.", roundStart);
    }

    function buyTicket(string memory _chosenNumbers) public payable isLotteryOpen hasCorrectPrice {
        Ticket memory _ticket = Ticket({chosenNumbers: _chosenNumbers, roundStart: roundStart, ticketOwner: msg.sender});
        ticketsByAddress[msg.sender].push(_ticket);

        addressByChosenNumbersByRoundStart[roundStart][_chosenNumbers].push(msg.sender);
        currentParticipants++;
        refundableTicketHolders.push(msg.sender);
        jackpot += msg.value;
    }

    modifier isLotteryOpen() {
        require(!lotteryClosed, "The lottery is closed.");
        require(!hasRoundEnded(),
            "The current has ended. Call 'drawWinningNumbers' and 'checkWinnings' to distribute winnings and start a new round.");
        _;
    }

    modifier hasCorrectPrice() {
        require(msg.value == price, "The value of the transaction is either too high or too low.");
        _;
    }

    function drawWinningNumbers() public isDrawWinningNumbersAllowed {
        if (currentParticipants == 0) {
            drawingFinished = true;
            emit DrawingFinishedEvent("No ticket was bought in this round, no need to draw a winning numbers.", roundStart);
            return;
        }

        if (address(this).balance >= oracleFee) {
            oracleAddress.transfer(oracleFee);
            if (jackpot >= oracleFee) {
                jackpot -= oracleFee;
            } else {
                jackpot = 0;
            }

            lastOracleQueryId = oracle.generateRandomNumber();
            if (lastOracleQueryId == 0x0000000000000000000000000000000000000000000000000000000000000000) {
                failedOracleAttempts++;
            }
            else {
                waitingForWinningNumbers = true;
            }
        } else {
            emit ProvideOracleFeeEvent("The contract balance is not large enough to pay the oracle fee. Transfer some ether to the contract.", roundStart);
        }
    }

    modifier isDrawWinningNumbersAllowed() {
        require(!lotteryClosed, "The lottery is closed.");
        require(hasRoundEnded(), "Round has not ended, yet.");
        require(!waitingForWinningNumbers, "Already waiting for winning number to be drawn by the oracle.");
        require(bytes(winningNumbersByRoundStart[roundStart]).length == 0, "Winning number already drawn. Call payout until a new round starts.");
        _;
    }

    function hasRoundEnded() private view returns (bool) {
        return (now > roundStart + roundDuration) || forcedRoundEnd;
    }

    function checkWinnings() public {
        if (waitingForWinningNumbers) {
            retrieveWinningNumbers();
        }

        distributeWinnings();

        if (winningsByAddress[msg.sender] > 0) {
            uint winningsForCaller = winningsByAddress[msg.sender];
            winningsByAddress[msg.sender] = 0;
            msg.sender.transfer(winningsForCaller);
            emit PayoutEvent("You have won the lottery. Your share of the jackpot has been transered to your account.", msg.sender);
        }
    }

    function retrieveWinningNumbers() private {
        bool processed = oracle.isQueryProcessed(lastOracleQueryId);
        if (processed) {
            string memory randomNumbers = oracle.getRandomNumber(lastOracleQueryId);
            if (bytes(randomNumbers).length > 0) {
                winningNumbersByRoundStart[roundStart] = randomNumbers;
                drawingFinished = true;
                emit DrawingFinishedEvent("Winning numbers have been drawn.", roundStart);
            } else {
              failedOracleAttempts++;
            }
            waitingForWinningNumbers = false;
        }
    }

    function distributeWinnings() private {
        if (lotteryClosed || !hasRoundEnded() || !drawingFinished) {
            return;
        }

        if (currentParticipants == 0) {
            initiateNextRound();
            return;
        }

        string memory winningNumbers = winningNumbersByRoundStart[roundStart];
        address payable[] memory winners = addressByChosenNumbersByRoundStart[roundStart][winningNumbers];
        if (winners.length == 0) {
            initiateNextRound();
            return;
        }

        uint endIndex = processedWinners + batchSize - 1;
        if (endIndex > winners.length - 1) {
            endIndex = winners.length - 1;
        }

        uint jackpotSplit = jackpot / winners.length;
        for (uint i = processedWinners; i <= endIndex; i++) {
            address winnerAddress = winners[i];
            uint currentWinnings = winningsByAddress[winnerAddress];
            winningsByAddress[winnerAddress] = currentWinnings + jackpotSplit;
            processedWinners++;
        }

        if (processedWinners >= winners.length) {
            delete refundableTicketHolders;
            jackpot = 0;
            initiateNextRound();
        }
        else {
            emit UnfinishedBatchProcessingEvent("Not all winners have been processed, yet. Keep calling the 'checkWinnings()' function until all winner have been processed to start the next round.", roundStart);
        }
    }

    function initiateNextRound() private {
        forcedRoundEnd = false;
        drawingFinished = false;
        failedOracleAttempts = 0;
        processedWinners = 0;
        currentParticipants = 0;
        roundStart = now;
        emit RoundStartEvent("A new round of the lottery has started.", roundStart);
    }

    function closeLottery() public isClosingAllowed {
        if (!lotteryClosed) {
            lotteryClosed = true;
            emit LotteryClosedEvent("The lottery has been closed.");
        }

        uint endIndex = processedRefunds + batchSize - 1;
        if (endIndex > refundableTicketHolders.length - 1) {
            endIndex = refundableTicketHolders.length - 1;
        }

        for (uint i = processedRefunds; i <= endIndex; i++) {
            address payable refundAddress =  refundableTicketHolders[i];
            uint currentRefunds = refundsByAddress[refundAddress];
            refundsByAddress[refundAddress] = currentRefunds + price;
            processedRefunds++;
        }

        if (processedRefunds < refundableTicketHolders.length) {
            emit UnfinishedBatchProcessingEvent("Not all refunds have been processed, yet. Keep calling the 'closeLottery()' function until all refunds have been processed.", roundStart);
        }

        if (refundsByAddress[msg.sender] > 0) {
            uint refundsForCaller = refundsByAddress[msg.sender];
            refundsByAddress[msg.sender] = 0;
            msg.sender.transfer(refundsForCaller);
            emit PayoutEvent("The lottery was closed without a winner. Already processed refunds have been transfered to your accounts.", msg.sender);
        }
    }

    modifier isClosingAllowed() {
        require(!drawingFinished, "Winning numbers for the last round could be retrieved.");
        require(failedOracleAttempts >= 3 || msg.sender == owner, "Not enough failed oracle attempts to close the lottery.");
        _;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // Getters
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function isLotteryClosed() public view returns (bool) {
        return lotteryClosed;
    }

    function isForcedRoundEnd() public view returns (bool) {
        return forcedRoundEnd;
    }

    function hasDrawingFinished() public view returns (bool) {
        return drawingFinished;
    }

    function isWaitingForWinningNumbers() public view returns (bool) {
        return waitingForWinningNumbers;
    }

    function isQueryProcessed() public view returns (bool) {
        return oracle.isQueryProcessed(lastOracleQueryId);
    }

    function getCurrentParticipants() public view returns (uint) {
        return currentParticipants;
    }

    function getCurrentRoundStart() public view returns (uint) {
        return roundStart;
    }

    function getCurrentRoundEnd() public view returns (uint) {
        return roundStart + roundDuration;
    }

    function getRoundDuration() public view returns (uint) {
        return roundDuration;
    }

    function getJackpot() public view returns (uint) {
        return jackpot;
    }

    function getTicketsForAddress(address _account) public view returns (Ticket[] memory) {
        return ticketsByAddress[_account];
    }

    function getWinningNumbersForRoundStart(uint _roundStart) public view returns (string memory) {
        return winningNumbersByRoundStart[_roundStart];
    }
}
