import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {MetaMaskService} from '../metamask.service';
import {tick} from '@angular/core/testing';
import {Ticket} from '../class';
import {PageChangedEvent} from 'ngx-bootstrap';

@Component({
  selector: 'app-lottery-page',
  templateUrl: './lottery-page.component.html',
  styleUrls: ['./lottery-page.component.scss']
})
export class LotteryPageComponent implements OnInit, OnDestroy {
  public networkName: string;

  private lotteryNumbers: number[] = [];
  private chosenNumbers: number[] = [];
  private amountOfNumbers = 24;
  private amountToChoose = 4;
  private jackpot = 'Updating';
  private timeLeft = 0;
  private timeLeftDisplayText = 'Updating';
  private lotteryClosed = false;
  private forcedRoundEnd: boolean;
  private currentParticipants: number;
  private waitingForWinningNumbers = false;
  private queryProcessed: boolean;
  private drawingFinished: boolean;
  private updateSubscrption: Subscription;
  public tickets: Ticket[] = [];
  public showedTickets: Ticket[] = [];
  public maxTicketsPerPage = 3;
  private currentPage = 1;

  constructor(private metaMaskService: MetaMaskService,
              private ngZone: NgZone) {
  }

  async ngOnInit() {
    await this.metaMaskService.init();
    this.networkName = this.metaMaskService.currentNetwork;
    await this.initLottery();
    this.startEventListening();

    this.ngZone.run(() => {
      this.updateSubscrption = timer(1, 1000).subscribe(x =>  {
        this.updateLottery(x);
      });
    });
  }

  ngOnDestroy(): void {
    this.updateSubscrption.unsubscribe();
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
    await this.updateJackpot();
    await this.updateTimeLeft();
  }

  private updateLottery(tick: number) {
    this.timeLeft = this.timeLeft - 1;
    if (tick % 10 === 0) {
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
    // TODO: Replace alerts with modal windows.
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
          alert('The winning numbers could not be drawn because the oracle fee could not be paid for. ' +
            'Someone must send some funds to the oracle contract.');
          break;
        case 'DrawingFinishedEvent':
          this.updateLottery(0);
          break;
        case 'PayoutEvent':
          // TODO: Differentiate between winnings and refunds.
          // TODO: Filter for sender account payouts.
          alert('Congratulations, you have won in the lottery. Your winnings have been transferred to your account.');
          break;
        case 'RoundStartEvent':
          this.updateLottery(0);
          break;
      }
    });

    // TODO: All events from both contracts are duplicated for some reason whenever a new listener is registered.
    //       Only register to one contract?
    this.metaMaskService.oracleContract.events.allEvents({
      fromBlock: 'latest'
    }, (error, event) => {
      if (error) {
        console.error('Error while waiting for oracle contract events.');
        return;
      }
      console.log('Oracle contract event arrived.', event);
      switch (event.event) {
        case 'QueryFinishedEvent':
          this.updateLottery(0);
          break;
      }
    });
  }

  private updateTimerDisplayText() {
    if (this.lotteryClosed || this.timeLeft <= 0 || this.forcedRoundEnd) {
      this.timeLeftDisplayText = 'Round has ended';
      return;
    }

    let time: number = this.timeLeft;
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

  public async updateJackpot() {
    const jackpot = await this.metaMaskService.lotteryContract.methods.getJackpot().call();
    this.jackpot = (+jackpot.toString() / Math.pow(10, 18)) + ' Ξ';
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
    await this.metaMaskService.buyTicket('Set 1: ' + stringifiedNumbers);
    this.chosenNumbers = [];
    await this.updateJackpot();
  }

  public async checkRefunds() {
    await this.metaMaskService.closeLottery();
  }

  // Select a number on the grid
  public mutateLotteryNumber(lotteryNumber: number): void {
    (this.chosenNumbers.includes(lotteryNumber)) ?
      this.chosenNumbers = this.chosenNumbers.filter((n) => n !== lotteryNumber) :
      (this.chosenNumbers.length < this.amountToChoose) && this.chosenNumbers.push(lotteryNumber);
  }

  // select randomly the numbers on the grid
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

  public async checkWinnings() {
    await this.metaMaskService.checkWinnings();
  }

  public isDrawWinningNumbersDisabled(): boolean {
    return this.lotteryClosed || !this.hasRoundEnded() || this.waitingForWinningNumbers || this.drawingFinished;
  }

  public showCheckWinningsBanner(): boolean {
    return !this.lotteryClosed && this.hasRoundEnded() &&
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

  public formateSCNumbersBack(scNumber: string): number[] {
    if (scNumber) {
      return scNumber.split(':')[1].split(',').map(s => +s.trim());
    }
  }

  public formateDate(date: number): Date {
    const formattedDate = new Date(0);
    formattedDate.setUTCSeconds(+date.toString());
    return formattedDate;
  }

}
