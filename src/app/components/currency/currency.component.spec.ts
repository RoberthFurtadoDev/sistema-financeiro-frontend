import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Currency } from './currency';

describe('Currency', () => {
  let component: Currency;
  let fixture: ComponentFixture<Currency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Currency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Currency);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
