import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {DistrictModel} from "../../../_models/DistrictModel";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzSelectModule} from "ng-zorro-antd/select";
import {AlertComponent} from "../../../_components";
import {first} from "rxjs";

@Component({
    selector: 'app-add-school',
    imports: [
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSelectModule,
    AlertComponent
],
    templateUrl: './add.component.html',
    styleUrl: './add.component.css'
})
export class AddSchoolComponent implements OnInit {
  schoolForm!: FormGroup;
  districts: DistrictModel[] = [];
  loading = false;

  get districtOptions() {
    return this.districts.map(d => ({label: d.districtName || '', value: d.id}));
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.schoolForm = this.fb.group({
      name: ['', Validators.required],
      districtId: [''],
    });

    this.apiService.listAllDistricts().subscribe({
      next: (districts) => this.districts = districts,
    });
  }

  onSubmit(): void {
    if (this.schoolForm.valid) {
      this.loading = true;
      const formValue = this.schoolForm.value;
      this.apiService.upsertSchool({name: formValue.name, isActive: true, districtId: formValue.districtId || undefined} as any)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('School created successfully', true);
            this.router.navigate(['/schools']);
          },
          error: error => {
            this.loading = false;
            this.alertService.error(error.error?.message || error.message || 'Failed to create school');
          }
        });
    }
  }
}
