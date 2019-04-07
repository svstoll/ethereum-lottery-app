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
  }

  public getBalance() {
    this.donationService.getBalance().then(() => console.log('Balance call finished.'));
  }
}
