import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeBuilderComponent } from './molecule-builder.component';

describe('MoleculeBuilderComponent', () => {
  let component: MoleculeBuilderComponent;
  let fixture: ComponentFixture<MoleculeBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoleculeBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoleculeBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
