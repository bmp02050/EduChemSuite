import {Component, OnInit} from '@angular/core';
import {AlertService, ApiService} from "../../_services";
import {distinctUntilChanged, first, Observable, of, ReplaySubject, shareReplay} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {AsyncPipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzMenuDirective, NzMenuItemComponent} from "ng-zorro-antd/menu";
import {NzSelectComponent, NzSelectOptionInterface} from "ng-zorro-antd/select";
import {AddComponent} from "./add/add.component";
import {StorageService} from "../../_services/storage.service";
import {NzFormTextComponent} from "ng-zorro-antd/form";
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DistrictModel} from "../../_models/DistrictModel";
import {UserDistrictModel} from "../../_models/UserDistrictModel";
import {DistrictSchoolsModel} from "../../_models/DistrictSchoolsModel";

@Component({
  selector: 'app-districts',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NzDropdownMenuComponent,
    NgForOf,
    NzMenuDirective,
    NzMenuItemComponent,
    NzSelectComponent,
    AddComponent,
    NzFormTextComponent,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './districts.component.html',
  styleUrl: './districts.component.css'
})
export class DistrictsComponent implements OnInit {
  myDistricts$: Observable<NzSelectOptionInterface[]>;
  selectedDistrict: ReplaySubject<DistrictModel> = new ReplaySubject(1);
  selectedDistrict$ = this.selectedDistrict.asObservable().pipe(distinctUntilChanged());
  districtForm!: FormGroup;
  selectedDistrictId: string | null = null;
  users$: Observable<NzSelectOptionInterface[]>;
  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private alertService: AlertService,
  ) {
    this.myDistricts$ = this.apiService.listMyDistricts(this.storageService.getUser().id).pipe(
      map(districts => districts.map(district => ({
        label: district.districtName || '', // Ensure label is always defined
        value: district || [] // Ensure value is always defined
      }) as NzSelectOptionInterface)),
      catchError(error => {
        console.error('Error fetching districts:', error);
        return of([]);
      }),
      shareReplay(1)
    );

    //TODO: Get Admin/Staff users associated with district
    //this.users$ = this.apiService.
  }

  ngOnInit(): void {
    this.districtForm = this.fb.group({
      id: ['', Validators.required],
      districtName: ['', Validators.required],
      createdAt: [''], // Optional field
      updatedAt: [''], // Optional field
      isActive: [true], // Default value
      administrators: this.fb.array([]),
      schools: this.fb.array([]),
    });

    this.selectedDistrict$.subscribe(district => {
      this.districtForm.patchValue(district);
      // Populate administrators and schools arrays
      // Populate administrators and schools arrays
      this.setAdministrators(district.administrators ||[]);
      this.setSchools(district.schools || []);
    });
  }

  onDistrictSelect(district: any): void {
    console.log(district);
    this.selectedDistrict.next(district);
  }

  onSubmit(): void {
    if (this.districtForm.valid) {
      const formData = this.districtForm.value;
      console.log('Form Data:', formData);

      this.apiService.upsertDistrict(formData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('New District created', true);
            window.location.reload();
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
  }
  // Utility methods to handle FormArray
  get administrators(): FormArray {
    return this.districtForm.get('administrators') as FormArray;
  }

  get schools(): FormArray {
    return this.districtForm.get('schools') as FormArray;
  }

  private setAdministrators(admins: UserDistrictModel[]): void {
    const adminArray = this.administrators;
    adminArray.clear();
    admins.forEach(admin => {
      adminArray.push(this.fb.group({
        userId: [admin.userId],
        name: [admin.user?.firstName + " " + admin.user?.lastName]
      }));
    });
  }

  private setSchools(schools: DistrictSchoolsModel[]): void {
    const schoolArray = this.schools;
    schoolArray.clear();
    schools.forEach(school => {
      schoolArray.push(this.fb.group({
        schoolId: [school.schoolId],
        // add more fields if necessary
      }));
    });
  }
}
