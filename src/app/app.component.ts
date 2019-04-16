import {Component, OnInit} from '@angular/core';
import {MetaMaskService} from './metamask.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public lotteryNumbers: number[] = [];
  public luckyNumbers: number[] = [];
  public chosenNumbers: number[] = [];
  public chosenLuckyNumber: number = null;

  constructor(private donationService: MetaMaskService) {
  }

  ngOnInit() {
    this.donationService.init();
    for (let i = 0; i < 42; i++) {
      this.lotteryNumbers[i] = i + 1;
    }
    for (let i = 0; i < 6; i++) {
      this.luckyNumbers[i] = i + 1;
    }
    // this.getBalance();
  }

  public getBalance(): void {
    this.donationService.getBalance().then(() => console.log('Balance call finished.'));
  }

  public mutateLotteryNumber(lotteryNumber: number): void {
    (this.chosenNumbers.includes(lotteryNumber)) ?
      this.chosenNumbers = this.chosenNumbers.filter((n) => n !== lotteryNumber) :
      (this.chosenNumbers.length < 6) && this.chosenNumbers.push(lotteryNumber);
    console.log(this.chosenNumbers);
  }

  public mutateLuckyNumber(luckyNumber: number): void {
    this.chosenLuckyNumber = luckyNumber;
  }
}
