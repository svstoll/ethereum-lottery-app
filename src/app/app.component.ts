import {Component, NgZone, OnInit} from '@angular/core';
import {MetaMaskService} from './metamask.service';
import {WinninTableEntry} from './class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public lotteryNumbers: number[] = [];
  public chosenNumbers: number[] = [];
  public amountOfNumbers = 9;
  public amountToChoose = 4;
  public pricePool: number;
  public currentRound: number;
  public winningTable: WinninTableEntry[] = [];

  constructor(private donationService: MetaMaskService,
              private ngZone: NgZone) {
  }

  ngOnInit() {
    this.donationService.init();
    for (let i = 0; i < this.amountOfNumbers; i++) {
      this.lotteryNumbers[i] = i + 1;
    }
    this.setPricePool();
    this.setWinningTable();
  }

  public setWinningTable() {
    this.donationService.getCurrentRound().subscribe((round: number) => {
      this.ngZone.run(() => {
        this.currentRound = round;
      })
      for (let i = 1; i < +round.toString(); i++) {
        const winningTableEntry = new WinninTableEntry();
        winningTableEntry.round = i;
        this.donationService.getWinningNumberForRound(i).subscribe((winningNumber: number) => {
          console.log(winningNumber)
          for (let p = 0; p < winningNumber.toString().length; p++) {
            winningTableEntry.winningNumbers.push(+winningNumber.toString()[p]);
          }
          this.donationService.getWinnersForRound(i).subscribe((winners: string[]) => {
            winners.forEach(winner => winningTableEntry.winners.push(winner));
            this.ngZone.run(() => {
              this.winningTable.push(winningTableEntry);
            });
          });
        });
      }
    });
  }

  public setPricePool() {
    this.donationService.getPricePool().subscribe((result) => {
      this.ngZone.run(() => {
        this.pricePool = (+result.toString() / Math.pow(10, 18));
      });
    });
  }

  public buyTicket(): void {
    if (this.amountToChoose !== this.chosenNumbers.length) {
      // todo: display an error that the amount of numbers needs to be chosen
      return;
    }
    // Converts the numbers for the contract
    const numberToSend = +this.chosenNumbers
      .sort()
      .reverse()
      .reduce((a, b) => a.toString() + b.toString(), '');
    this.donationService.buyTicket(numberToSend).subscribe(() => {
      this.setPricePool();
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
}
