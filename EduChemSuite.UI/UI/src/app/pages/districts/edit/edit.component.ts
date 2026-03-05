import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {DistrictModel} from "../../../_models/DistrictModel";
import {UserModel} from "../../../_models/UserModel";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {StorageService} from "../../../_services/storage.service";
import {AlertComponent} from "../../../_components";
import {first} from "rxjs";

@Component({
    selector: 'app-edit-district',
    imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzSpinModule,
    NzSelectModule,
    NzPopconfirmModule,
    NzCardModule,
    AlertComponent
],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.css'
})
export class EditDistrictComponent implements OnInit {
  districtForm!: FormGroup;
  district: DistrictModel | null = null;
  loading = true;
  districtId!: string;
  availableUsers: UserModel[] = [];
  selectedUserId: string | null = null;
  addingUser = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.districtId = this.route.snapshot.paramMap.get('id')!;
    this.districtForm = this.fb.group({
      districtName: ['', Validators.required],
    });

    this.loadDistrict();
    this.apiService.listAllUsers().subscribe({
      next: (users) => this.availableUsers = users,
      error: (err) => {
        this.alertService.error(err.error?.message || 'Failed to load users.');
      }
    });
  }

  loadDistrict(): void {
    this.apiService.getDistrict(this.districtId).subscribe({
      next: (district) => {
        this.district = district;
        this.districtForm.patchValue({districtName: district.districtName});
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.error(err.error?.message || 'Failed to load district.');
      }
    });
  }

  get filteredAvailableUsers(): UserModel[] {
    const adminIds = (this.district?.administrators || []).map(a => a.user?.id).filter(Boolean);
    return this.availableUsers.filter(u => !adminIds.includes(u.id));
  }

  get userOptions() {
    return this.filteredAvailableUsers.map(u => ({
      label: u.firstName + ' ' + u.lastName + ' (' + u.email + ')',
      value: u.id
    }));
  }

  addAdministrator(): void {
    if (!this.selectedUserId) return;
    this.addingUser = true;
    this.apiService.addUserToDistrict(this.districtId, this.selectedUserId).subscribe({
      next: () => {
        this.selectedUserId = null;
        this.addingUser = false;
        this.loadDistrict();
        this.alertService.success('Administrator added successfully');
      },
      error: (err) => {
        this.addingUser = false;
        this.alertService.error(err.error?.message || 'Failed to add administrator');
      }
    });
  }

  removeAdministrator(userId: string): void {
    this.apiService.removeUserFromDistrict(this.districtId, userId).subscribe({
      next: () => {
        this.loadDistrict();
        this.alertService.success('Administrator removed successfully');
      },
      error: (err) => {
        this.alertService.error(err.error?.message || 'Failed to remove administrator');
      }
    });
  }

  onSubmit(): void {
    if (this.districtForm.valid && this.district) {
      const updated = {
        id: this.district.id,
        districtName: this.districtForm.value.districtName,
        userId: this.storageService.getUser().id,
      };
      this.apiService.upsertDistrict(updated as any)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('District updated successfully', true);
            this.router.navigate(['/districts']);
          },
          error: (err) => {
            const message = err.error?.message || err.error || 'Failed to update district.';
            this.alertService.error(message);
          }
        });
    }
  }
}
