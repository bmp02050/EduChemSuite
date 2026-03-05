import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {SchoolModel} from "../../../_models/SchoolModel";
import {UserModel} from "../../../_models/UserModel";
import {AccountType} from "../../../_models/AccountType";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {AlertComponent} from "../../../_components";
import {first} from "rxjs";

@Component({
    selector: 'app-edit-school',
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
export class EditSchoolComponent implements OnInit {
  schoolForm!: FormGroup;
  school: SchoolModel | null = null;
  loading = true;
  schoolId!: string;
  availableUsers: UserModel[] = [];
  selectedStaffUserId: string | null = null;
  selectedStudentUserId: string | null = null;
  addingStaff = false;
  addingStudent = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.schoolId = this.route.snapshot.paramMap.get('id')!;
    this.schoolForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.loadSchool();
    this.apiService.listAllUsers().subscribe({
      next: (users) => this.availableUsers = users,
      error: () => {}
    });
  }

  loadSchool(): void {
    this.apiService.getSchool(this.schoolId).subscribe({
      next: (school) => {
        this.school = school;
        this.schoolForm.patchValue({name: school.name});
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredStaffUsers(): UserModel[] {
    const staffIds = (this.school?.staff || []).map(u => u.id).filter(Boolean);
    return this.availableUsers.filter(u =>
      (u.accountType === AccountType.Staff || u.accountType === AccountType.AdminStaff) &&
      !staffIds.includes(u.id)
    );
  }

  get filteredStudentUsers(): UserModel[] {
    const studentIds = (this.school?.students || []).map(u => u.id).filter(Boolean);
    return this.availableUsers.filter(u =>
      u.accountType === AccountType.Student &&
      !studentIds.includes(u.id)
    );
  }

  get staffUserOptions() {
    return this.filteredStaffUsers.map(u => ({
      label: u.firstName + ' ' + u.lastName + ' (' + u.email + ')',
      value: u.id
    }));
  }

  get studentUserOptions() {
    return this.filteredStudentUsers.map(u => ({
      label: u.firstName + ' ' + u.lastName + ' (' + u.email + ')',
      value: u.id
    }));
  }

  addStaffMember(): void {
    if (!this.selectedStaffUserId) return;
    this.addingStaff = true;
    this.apiService.addUserToSchool(this.schoolId, this.selectedStaffUserId).subscribe({
      next: () => {
        this.selectedStaffUserId = null;
        this.addingStaff = false;
        this.loadSchool();
        this.alertService.success('Staff member added successfully');
      },
      error: (err) => {
        this.addingStaff = false;
        this.alertService.error(err.error?.message || 'Failed to add staff member');
      }
    });
  }

  removeStaffMember(userId: string): void {
    this.apiService.removeUserFromSchool(this.schoolId, userId).subscribe({
      next: () => {
        this.loadSchool();
        this.alertService.success('Staff member removed successfully');
      },
      error: (err) => {
        this.alertService.error(err.error?.message || 'Failed to remove staff member');
      }
    });
  }

  addStudent(): void {
    if (!this.selectedStudentUserId) return;
    this.addingStudent = true;
    this.apiService.addUserToSchool(this.schoolId, this.selectedStudentUserId).subscribe({
      next: () => {
        this.selectedStudentUserId = null;
        this.addingStudent = false;
        this.loadSchool();
        this.alertService.success('Student added successfully');
      },
      error: (err) => {
        this.addingStudent = false;
        this.alertService.error(err.error?.message || 'Failed to add student');
      }
    });
  }

  removeStudent(userId: string): void {
    this.apiService.removeUserFromSchool(this.schoolId, userId).subscribe({
      next: () => {
        this.loadSchool();
        this.alertService.success('Student removed successfully');
      },
      error: (err) => {
        this.alertService.error(err.error?.message || 'Failed to remove student');
      }
    });
  }

  onSubmit(): void {
    if (this.schoolForm.valid && this.school) {
      const updated = {
        id: this.school.id,
        isActive: this.school.isActive,
        name: this.schoolForm.value.name,
        districtId: this.school.districtId,
      };
      this.apiService.upsertSchool(updated)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('School updated successfully');
          },
          error: (err) => {
            this.alertService.error(err.error?.message || err.message || 'Failed to update school');
          }
        });
    }
  }
}
