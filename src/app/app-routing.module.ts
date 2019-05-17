import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ErrorPageComponent} from './error-page/error-page.component';
import {LotteryPageComponent} from './lottery-page/lottery-page.component';

const routes: Routes = [
  { path: '', component: LotteryPageComponent },
  { path: 'error', component: ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
