import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subscription, timer} from 'rxjs';
import {WinninTableEntry} from '../class';
import {MetaMaskService} from '../metamask.service';

@Component({
  selector: 'app-lottery-page',
  templateUrl: './lottery-page.component.html',
  styleUrls: ['./lottery-page.component.scss']
})
export class LotteryPageComponent implements OnInit, OnDestroy {

  private lotteryNumbers: number[] = [];
  private chosenNumbers: number[] = [];
  private amountOfNumbers = 24;
  private amountToChoose = 4;
  private jackpot: number;
  private timeLeft = 0;
  private timeLeftDisplayText: string;
  private roundTimerSubscription: Subscription;
  private winningTable: WinninTableEntry[] = [];
  public networkName: string;

  constructor(private metaMaskService: MetaMaskService,
              private ngZone: NgZone) {
  }

  async ngOnInit() {
    await this.metaMaskService.init();
    this.networkName = this.metaMaskService.currentNetwork;
    for (let i = 0; i < this.amountOfNumbers; i++) {
      this.lotteryNumbers[i] = i + 1;
    }
    await this.setJackpot();
    await this.setTimeLeft();


    this.ngZone.run(() => {
      this.roundTimerSubscription = timer(1000, 1000).subscribe(x =>  {
        this.timeLeft = this.timeLeft - 1;
        this.updateTimerDisplayText();
      });
    });
  }

  ngOnDestroy(): void {
    this.roundTimerSubscription.unsubscribe();
  }

  private updateTimerDisplayText() {
    if (this.timeLeft <= 0) {
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

  public async setJackpot() {
    const jp = await this.metaMaskService.lotteryContract.methods.getJackpot().call();
    this.jackpot = (+jp.toString() / Math.pow(10, 18));
  }

  public async setTimeLeft() {
    const tl = await this.metaMaskService.lotteryContract.methods.getTimeLeft().call();
    this.timeLeft = tl;
  }

  public async buyTicket() {
    if (this.amountToChoose !== this.chosenNumbers.length) {
      return;
    }

    const stringifiedNumbers = this.chosenNumbers
      .sort((n1, n2) => n1 - n2)
      .join(', ');
    await this.metaMaskService.buyTicket(stringifiedNumbers);
    await this.setJackpot();
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
}
