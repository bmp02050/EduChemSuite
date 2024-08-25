import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDistrictAdministratorsComponent } from './add-district-administrators.component';

describe('AddDistrictAdministratorsComponent', () => {
  let component: AddDistrictAdministratorsComponent;
  let fixture: ComponentFixture<AddDistrictAdministratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDistrictAdministratorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDistrictAdministratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
