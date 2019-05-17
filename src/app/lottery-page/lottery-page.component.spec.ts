import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LotteryPageComponent } from './lottery-page.component';

describe('LotteryPageComponent', () => {
  let component: LotteryPageComponent;
  let fixture: ComponentFixture<LotteryPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotteryPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LotteryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
