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
  public amountOfNumbers = 18;
  public amountToChose = 4;

  constructor(private donationService: MetaMaskService) {
  }

  ngOnInit() {
    this.donationService.init();
    for (let i = 0; i < this.amountOfNumbers; i++) {
      this.lotteryNumbers[i] = i + 1;
    }
  }

  public getBalance(): void {
    this.donationService.getHelloWorld(this.donationService.getAccounts()[0]);
  }

  public mutateLotteryNumber(lotteryNumber: number): void {
    (this.chosenNumbers.includes(lotteryNumber)) ?
      this.chosenNumbers = this.chosenNumbers.filter((n) => n !== lotteryNumber) :
      (this.chosenNumbers.length < this.amountToChose) && this.chosenNumbers.push(lotteryNumber);
  }

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
