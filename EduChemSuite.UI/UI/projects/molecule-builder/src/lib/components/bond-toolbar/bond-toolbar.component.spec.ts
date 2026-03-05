import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondToolbarComponent } from './bond-toolbar.component';

describe('BondToolbarComponent', () => {
  let component: BondToolbarComponent;
  let fixture: ComponentFixture<BondToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BondToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
