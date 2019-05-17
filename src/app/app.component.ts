import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MetaMaskService} from './metamask.service';
import {WinninTableEntry} from './class';
import {Subscription} from 'rxjs';
import {timer} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private lotteryNumbers: number[] = [];
  private chosenNumbers: number[] = [];
  private amountOfNumbers = 24;
  private amountToChoose = 4;
  private jackpot: number;
  private timeLeft = 0;
  private timeLeftDisplayText: string;
  private roundTimerSubscription: Subscription;
  private winningTable: WinninTableEntry[] = [];

  constructor(private metaMaskService: MetaMaskService,
              private ngZone: NgZone) {
  }

  ngOnInit() {
    this.metaMaskService.init();
    for (let i = 0; i < this.amountOfNumbers; i++) {
      this.lotteryNumbers[i] = i + 1;
    }
    this.setJackpot();
    this.setTimeLeft();


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

  public setJackpot() {
    this.metaMaskService.getJackpot().subscribe((result) => {
      this.ngZone.run(() => {
        console.log(result.toString());
        this.jackpot = (+result.toString() / Math.pow(10, 18));
      });
    });
  }

  public setTimeLeft() {
    this.metaMaskService.getTimeLeft().subscribe((result) => {
      this.timeLeft = +result.toString();
    });
  }

  public buyTicket(): void {
    if (this.amountToChoose !== this.chosenNumbers.length) {
      return;
    }

    const stringifiedNumbers = this.chosenNumbers
      .sort((n1, n2) => n1 - n2)
      .join(', ');
    this.metaMaskService.buyTicket('Set 1: ' + stringifiedNumbers).subscribe(() => {
      this.setJackpot();
    });
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

  public drawWinningNumbers() {
    this.metaMaskService.drawWinningNumbers().subscribe(() => {console.log('executed')});
  }

  public checkWinnings() {
    this.metaMaskService.checkWinnings().subscribe(() => {console.log('executed')});
  }

  public setWinningTable() {
    this.metaMaskService.getCurrentRoundStart().subscribe((round: number) => {
      this.ngZone.run(() => {
        // this.currentRound = round;
      });
      for (let i = 1; i < +round.toString(); i++) {
        const winningTableEntry = new WinninTableEntry();
        winningTableEntry.round = i;
        this.metaMaskService.getWinningNumbersForRound(i).subscribe((winningNumber: number) => {
          console.log(winningNumber);
          for (let p = 0; p < winningNumber.toString().length; p++) {
            winningTableEntry.winningNumbers.push(+winningNumber.toString()[p]);
          }
          this.metaMaskService.getWinnersForRound(i).subscribe((winners: string[]) => {
            winners.forEach(winner => winningTableEntry.winners.push(winner));
            this.ngZone.run(() => {
              this.winningTable.push(winningTableEntry);
            });
          });
        });
      }
    });
  }
}
