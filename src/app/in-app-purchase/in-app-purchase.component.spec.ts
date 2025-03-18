import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InAppPurchaseComponent } from './in-app-purchase.component';

describe('InAppPurchaseComponent', () => {
  let component: InAppPurchaseComponent;
  let fixture: ComponentFixture<InAppPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InAppPurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InAppPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
