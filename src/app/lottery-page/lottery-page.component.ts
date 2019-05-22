import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {MetaMaskService} from '../metamask.service';
import {Ticket} from '../ticket';
import {PageChangedEvent} from 'ngx-bootstrap';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-lottery-page',
  templateUrl: './lottery-page.component.html',
  styleUrls: ['./lottery-page.component.scss']
})
export class LotteryPageComponent implements OnInit, OnDestroy {
  public networkName: string;

  private initializing = true;
  private currentAccount: string = null;
  private lotteryNumbers: number[] = [];
  private chosenNumbers: number[] = [];
  private amountOfNumbers = 24;
  private amountToChoose = 4;
  private ticketPrice = 1;
  private jackpot = 'Updating';
  private timeLeft = 0;
  private timeLeftDisplayText = 'Updating';
  private lotteryClosed = false;
  private forcedRoundEnd: boolean;
  private currentParticipants: number;
  private waitingForWinningNumbers = false;
  private queryProcessed: boolean;
  private drawingFinished: boolean;
  private updateSubscription: Subscription;
  public tickets: Ticket[] = [];
  public showedTickets: Ticket[] = [];
  public maxTicketsPerPage = 3;
  private currentPage = 1;

  constructor(private metaMaskService: MetaMaskService,
              private toastr: ToastrService,
              private ngZone: NgZone) {
  }

  async ngOnInit() {
    await this.metaMaskService.init();
    this.networkName = this.metaMaskService.currentNetwork;
    await this.initLottery();
    this.startEventListening();

    this.ngZone.run(() => {
      this.updateSubscription = timer(1, 1000).subscribe(x =>  {
        this.updateLottery(x);
      });
    });
  }

  ngOnDestroy(): void {
    this.updateSubscription.unsubscribe();
  }

  private async initLottery() {
    for (let i = 0; i < this.amountOfNumbers; i++) {
      this.lotteryNumbers[i] = i + 1;
    }

    this.updateLotteryClosed();
    this.updateForcedRoundEnd();
    this.updateCurrentParticipants();
    this.updateDrawingFinished();
    this.updateQueryProcessed();
    this.updateWaitingForWinningNumbers();
    this.updateTickets();
    this.updateTicketPrice();
    await this.updateJackpot();
    await this.updateTimeLeft();
    await this.updateCurrentAccount();
    this.initializing = false;
  }

  private async updateLottery(tick: number) {
    this.timeLeft = this.timeLeft - 1;
    if (tick % 5 === 0) {
      this.updateCurrentAccount();
      this.updateTimeLeft();
      this.updateJackpot();
      this.updateCurrentParticipants();
      this.updateDrawingFinished();
      this.updateLotteryClosed();
      this.updateForcedRoundEnd();
      this.updateQueryProcessed();
      this.updateWaitingForWinningNumbers();
      this.updateTickets();
    }

    this.updateTimerDisplayText();
  }

  private startEventListening() {
    // All events from both contracts are duplicated for some reason whenever a new listener is registered.
    // Therefore, we only register once until the bug is fixed in web3.js.
    this.metaMaskService.lotteryContract.events.allEvents({
      fromBlock: 'latest'
    }, (error, event) => {
      if (error) {
        console.error('Error while waiting for lottery contract events.');
        return;
      }
      console.log('Lottery contract event arrived.', event);
      switch (event.event) {
        case 'LotteryClosedEvent':
          this.lotteryClosed = true;
          break;
        case 'ForcedRoundEndEvent':
          this.forcedRoundEnd = true;
          break;
        case 'ProvideOracleFeeEvent':
          this.showOracleFeeError();
          break;
        case 'DrawingFinishedEvent':
          this.updateLottery(0);
          break;
        case 'WinnerEvent':
          if (event.returnValues._to && event.returnValues._to === this.currentAccount) {
            this.showLotteryWonMessage();
          }
          break;
        case 'RoundStartEvent':
          this.updateLottery(0);
          break;
        case 'QueryFinishedEvent':
          this.updateLottery(0);
          break;
      }
    });
  }

  private showLotteryWonMessage() {
    const message = 'Your winnings have been transferred to your account.';
    this.toastr.success(message, 'Lottery won!', {timeOut: 0});
  }

  private showOracleFeeError() {
    const message = 'The winning numbers could not be drawn because the oracle fee could not be paid for. ' +
      'Someone must send some funds to the oracle contract.';
    this.toastr.error(message, 'Oracle fee not covered.', {timeOut: 0});
  }

  private updateTimerDisplayText() {
    if (this.lotteryClosed) {
      this.timeLeftDisplayText = 'The lottery is closed.';
      return;
    }

    let time: number = this.timeLeft;
    if (this.timeLeft <= 0 || this.forcedRoundEnd) {
      time = 0;
    }

    const days = Math.floor(time / 86400);
    time -= days * 86400;
    const hours = Math.floor(time / 3600) % 24;
    time -= hours * 3600;
    const minutes = Math.floor(time / 60) % 60;
    time -= minutes * 60;
    const seconds = time % 60;

    this.timeLeftDisplayText = [
      days + 'd',
      hours + 'h',
      minutes + 'm',
      seconds + 's'
    ].join(' ');
  }

  public async updateCurrentAccount() {
    this.currentAccount = await this.metaMaskService.getCurrentAccount();
  }

  public async updateJackpot() {
    const jackpot = await this.metaMaskService.lotteryContract.methods.getJackpot().call();
    this.jackpot = (+jackpot.toString() / Math.pow(10, 18)) + ' ETH';
  }

  public async updateTimeLeft() {
    const roundEnd = await this.metaMaskService.lotteryContract.methods.getCurrentRoundEnd().call();
    const now = new Date();
    this.timeLeft = Math.floor((+roundEnd.toString()) - (now.getTime() / 1000));
  }

  public async updateCurrentParticipants() {
    const currentParticipants = await this.metaMaskService.lotteryContract.methods.getCurrentParticipants().call();
    this.currentParticipants = +currentParticipants.toString();
  }

  public async updateTicketPrice() {
    const ticketPrice = await this.metaMaskService.lotteryContract.methods.getTicketPrice().call();
    this.ticketPrice = ticketPrice / 1e18;
  }

  public async updateLotteryClosed() {
    const lotteryClosed = await this.metaMaskService.lotteryContract.methods.isLotteryClosed().call();
    this.lotteryClosed = lotteryClosed;
  }

  public async updateForcedRoundEnd() {
    const forcedRoundEnd = await this.metaMaskService.lotteryContract.methods.isForcedRoundEnd().call();
    this.forcedRoundEnd = forcedRoundEnd;
  }

  public async updateDrawingFinished() {
    const drawingFinished = await this.metaMaskService.lotteryContract.methods.hasDrawingFinished().call();
    this.drawingFinished = drawingFinished;
  }

  public async updateQueryProcessed() {
    const queryProcessed = await this.metaMaskService.lotteryContract.methods.isQueryProcessed().call();
    this.queryProcessed = queryProcessed;
  }

  public async updateWaitingForWinningNumbers() {
    const waitingForWinningNumbers = await this.metaMaskService.lotteryContract.methods.isWaitingForWinningNumbers().call();
    this.waitingForWinningNumbers = waitingForWinningNumbers;
  }

  public async updateTickets() {
    const tickets = await this.metaMaskService.getTicketsForAddress();
    for (const ticket of tickets) {
      const winningNumbers = await this.metaMaskService.lotteryContract.methods.getWinningNumbersForRoundStart(ticket.roundStart).call();
      ticket.winningNumbers = winningNumbers;
      ticket.won = (ticket.winningNumbers === ticket.chosenNumbers);
    }
    tickets.reverse();
    this.tickets = tickets;
    this.updatePage(this.currentPage);
  }

  public async buyTicket() {
    if (this.amountToChoose !== this.chosenNumbers.length) {
      return;
    }

    const stringifiedNumbers = this.chosenNumbers
      .sort((n1, n2) => n1 - n2)
      .join(', ');
    this.metaMaskService.buyTicket('Set 1: ' + stringifiedNumbers);
  }

  public async distributeRefunds() {
    await this.metaMaskService.distributeRefunds();
  }

  // Select a number on the grid.
  public mutateLotteryNumber(lotteryNumber: number): void {
    (this.chosenNumbers.includes(lotteryNumber)) ?
      this.chosenNumbers = this.chosenNumbers.filter((n) => n !== lotteryNumber) :
      (this.chosenNumbers.length < this.amountToChoose) && this.chosenNumbers.push(lotteryNumber);
  }

  // Randomly select the numbers on the grid.
  public randomPick(): void {
    this.chosenNumbers = [];
    while (this.chosenNumbers.length !== this.amountToChoose) {
      const numToAdd = Math.ceil(Math.random() * this.amountOfNumbers);
      if (!this.chosenNumbers.includes(numToAdd)) {
        this.chosenNumbers.push(numToAdd);
      }
    }
  }

  public async drawWinningNumbers() {
    await this.metaMaskService.drawWinningNumbers();
  }

  public async distributeWinnings() {
    await this.metaMaskService.distributeWinnings();
  }

  public showDrawWinningNumbersBanner(): boolean {
    return !this.initializing && !this.lotteryClosed && this.hasRoundEnded() && !(this.waitingForWinningNumbers || this.drawingFinished);
  }

  public showDistributeWinningsBanner(): boolean {
    return !this.initializing && !this.lotteryClosed && this.hasRoundEnded() &&
      (this.drawingFinished || (this.currentParticipants > 0 && this.waitingForWinningNumbers && this.queryProcessed));
  }

  public isBuyTicketsButtonDisabled(): boolean {
    return this.lotteryClosed || this.hasRoundEnded() || this.chosenNumbers.length !== this.amountToChoose;
  }

  private hasRoundEnded(): boolean {
    return this.forcedRoundEnd || this.timeLeft <= 0;
  }

  public pageChanged(event: PageChangedEvent): void {
    this.currentPage = event.page;
    this.updatePage(this.currentPage);
  }

  private updatePage(page: number): void {
    const startItem = (page - 1) * this.maxTicketsPerPage;
    const endItem = page * this.maxTicketsPerPage;
    this.showedTickets = this.tickets.slice(startItem, endItem);
  }

  public formatSCNumbersBack(scNumbers: string): number[] {
    if (scNumbers) {
      return scNumbers.split(':')[1].split(',').map(s => +s.trim());
    }
  }

  public formatDate(date: number): Date {
    const formattedDate = new Date(0);
    formattedDate.setUTCSeconds(+date.toString());
    return formattedDate;
  }
}
