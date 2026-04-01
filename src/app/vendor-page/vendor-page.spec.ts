import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorPage } from './vendor-page';

describe('VendorPage', () => {
  let component: VendorPage;
  let fixture: ComponentFixture<VendorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
