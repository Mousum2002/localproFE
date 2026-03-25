import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProListPreview } from './pro-list-preview';

describe('ProListPreview', () => {
  let component: ProListPreview;
  let fixture: ComponentFixture<ProListPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProListPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProListPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
