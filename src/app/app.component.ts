import {Component, OnInit} from '@angular/core';
import {MetaMaskService} from './metamask.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public lotteryNumbers: number[] = [];
  public chosenNumbers: number[] = [];
  public amountOfNumbers = 9;
  public amountToChose = 4;

  constructor(private donationService: MetaMaskService) {
  }

  ngOnInit() {
    this.donationService.init();
    for (let i = 0; i < this.amountOfNumbers; i++) {
      this.lotteryNumbers[i] = i + 1;
    }
  }

  public buyTicket(): void {
    if (this.amountToChose !== this.chosenNumbers.length) {
      // todo: display an error that the amount of numbers needs to be chosen
      return;
    }
    // Converts the numbers for the contract
    const numberToSend = +this.chosenNumbers
      .sort()
      .reverse()
      .reduce((a, b) => a.toString() + b.toString(), '');
    this.donationService.buyTicket(numberToSend);
  }

  // Select a number on the grid
  public mutateLotteryNumber(lotteryNumber: number): void {
    (this.chosenNumbers.includes(lotteryNumber)) ?
      this.chosenNumbers = this.chosenNumbers.filter((n) => n !== lotteryNumber) :
      (this.chosenNumbers.length < this.amountToChose) && this.chosenNumbers.push(lotteryNumber);
  }

  // select randomly the numbers on the grid
  public randomPick(): void {
    this.chosenNumbers = [];
    while (this.chosenNumbers.length !== this.amountToChose) {
      const numToAdd = Math.ceil(Math.random() * this.amountOfNumbers);
      if (!this.chosenNumbers.includes(numToAdd)) {
        this.chosenNumbers.push(numToAdd);
      }
    }
  }
}
