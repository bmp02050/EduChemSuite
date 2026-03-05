import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ApiService} from "../../../_services/api.service";
import {AlertService} from "../../../_services";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {NzAlertModule} from "ng-zorro-antd/alert";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzCardModule} from "ng-zorro-antd/card";
import {AccountType} from "../../../_models/AccountType";
import {AlertComponent} from "../../../_components";
import {DistrictModel} from "../../../_models/DistrictModel";
import {SchoolModel} from "../../../_models/SchoolModel";
import {first, forkJoin} from "rxjs";
import {AuthService} from "../../../_services/auth.service";
import {StorageService} from "../../../_services/storage.service";

@Component({
    selector: 'app-register',
    imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCheckboxModule,
    NzAlertModule,
    NzGridModule,
    NzDividerModule,
    NzCardModule,
    AlertComponent
],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  success = false;
  districts: DistrictModel[] = [];
  schools: SchoolModel[] = [];
  accountTypes: {label: string, value: AccountType}[] = [];

  get districtOptions() {
    return this.districts.map(d => ({label: d.districtName!, value: d.id}));
  }

  get schoolOptions() {
    return this.schools.map(s => ({label: s.name!, value: s.id}));
  }

  private static readonly accountTypeLabels: Record<number, string> = {
    [AccountType.Admin]: 'Admin',
    [AccountType.AdminStaff]: 'Admin Staff',
    [AccountType.Staff]: 'Staff',
    [AccountType.Student]: 'Student',
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private storageService: StorageService,
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      accountType: [AccountType.Student, Validators.required],
      isAdmin: [false],
      districtId: [null],
      schoolId: [null],
      address1: ['', Validators.required],
      address2: [''],
      address3: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
    });

    this.apiService.getInvitePermissions().subscribe({
      next: (permissions) => {
        this.accountTypes = (permissions.allowedAccountTypes || []).map((t: number) => ({
          label: RegisterComponent.accountTypeLabels[t] || `Type ${t}`,
          value: t as AccountType,
        }));

        // Default to Student if available, otherwise the last (least privileged) type
        const studentType = this.accountTypes.find(t => t.value === AccountType.Student);
        if (studentType) {
          this.form.patchValue({accountType: studentType.value});
        } else if (this.accountTypes.length > 0) {
          this.form.patchValue({accountType: this.accountTypes[this.accountTypes.length - 1].value});
        }

        if (permissions.allowedDistricts) {
          this.districts = permissions.allowedDistricts;
        }
        if (permissions.allowedSchools) {
          this.schools = permissions.allowedSchools;
        }
      },
      error: () => {
        // Fallback to loading all if permissions endpoint fails
        this.accountTypes = [
          {label: 'Student', value: AccountType.Student},
        ];
        this.apiService.listAllDistricts().subscribe({
          next: (districts) => this.districts = districts,
          error: () => {}
        });
        this.apiService.listAllSchools().subscribe({
          next: (schools) => this.schools = schools,
          error: () => {}
        });
      }
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    if (this.f['password'].value !== this.f['confirmPassword'].value) {
      this.alertService.error('Passwords do not match.');
      return;
    }

    this.loading = true;
    const {confirmPassword, districtId, schoolId, ...userData} = this.form.value;

    const email = userData.email;
    const password = this.f['password'].value;

    this.apiService.registerUser(userData).subscribe({
      next: (createdUser) => {
        const assignmentCalls = [];

        if (districtId) {
          assignmentCalls.push(this.apiService.addUserToDistrict(districtId, createdUser.id!));
        }
        if (schoolId) {
          assignmentCalls.push(this.apiService.addUserToSchool(schoolId, createdUser.id!));
        }

        const afterAssignment = () => {
          this.authService.login(email, password).pipe(first()).subscribe({
            next: (data) => {
              this.storageService.saveUser(data);
              this.loading = false;
              this.alertService.success('User created. Please change their password.', true);
              this.router.navigate(['/account/profile']);
            },
            error: () => {
              this.loading = false;
              this.alertService.success('User registered successfully. Please log in manually.', true);
              this.router.navigate(['/account/login']);
            }
          });
        };

        if (assignmentCalls.length > 0) {
          forkJoin(assignmentCalls).subscribe({
            next: () => afterAssignment(),
            error: () => {
              this.alertService.error('User registered but assignment failed. You can assign them manually.');
              afterAssignment();
            }
          });
        } else {
          afterAssignment();
        }
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message || err.error || 'Registration failed.';
        this.alertService.error(message);
      }
    });
  }
}
