import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {MetaMaskService} from './metamask.service';
import {Subscription} from 'rxjs';
import {timer} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor() {}

    ngOnInit(): void {
    }
}
