import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtomPaletteComponent } from './atom-palette.component';

describe('AtomPaletteComponent', () => {
  let component: AtomPaletteComponent;
  let fixture: ComponentFixture<AtomPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtomPaletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtomPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
