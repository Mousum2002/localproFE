import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProCard } from './pro-card';

describe('ProCard', () => {
  let component: ProCard;
  let fixture: ComponentFixture<ProCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
