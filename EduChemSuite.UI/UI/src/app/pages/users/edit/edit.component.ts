import {Component, OnInit} from '@angular/core';

import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {StorageService} from "../../../_services/storage.service";
import {UserModel} from "../../../_models/UserModel";
import {SchoolModel} from "../../../_models/SchoolModel";
import {DistrictModel} from "../../../_models/DistrictModel";
import {AccountType} from "../../../_models/AccountType";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzDescriptionsModule} from "ng-zorro-antd/descriptions";
import {NzTagModule} from "ng-zorro-antd/tag";

@Component({
    selector: 'app-edit-user',
    imports: [
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzTableModule,
    NzSpinModule,
    NzSelectModule,
    NzPopconfirmModule,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule
],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.css'
})
export class EditUserComponent implements OnInit {
  user: UserModel | null = null;
  loading = true;
  userId!: string;
  allSchools: SchoolModel[] = [];
  allDistricts: DistrictModel[] = [];
  selectedSchoolId: string | null = null;
  selectedDistrictId: string | null = null;
  addingSchool = false;
  addingDistrict = false;
  callerAccountType: AccountType | null = null;
  selectedAccountType: AccountType | null = null;
  savingAccountType = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    const currentUser = this.storageService.getUser();
    if (currentUser?.accountType !== undefined) {
      this.callerAccountType = currentUser.accountType as AccountType;
    }
    this.loadUser();

    this.apiService.listAllSchools().subscribe({
      next: (schools) => this.allSchools = schools,
      error: () => {}
    });

    this.apiService.listAllDistricts().subscribe({
      next: (districts) => this.allDistricts = districts,
      error: () => {}
    });
  }

  loadUser(): void {
    this.apiService.getUser(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.selectedAccountType = user.accountType ?? null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getAccountTypeLabel(type: AccountType | undefined): string {
    if (type === undefined || type === null) return 'Unknown';
    return AccountType[type] || 'Unknown';
  }

  get filteredSchools(): SchoolModel[] {
    const assignedSchoolIds = (this.user?.userSchools || []).map(us => us.schoolId || us.school?.id).filter(Boolean);
    return this.allSchools.filter(s => !assignedSchoolIds.includes(s.id));
  }

  get filteredDistricts(): DistrictModel[] {
    const assignedDistrictIds = (this.user?.userDistricts || []).map(ud => ud.districtId || ud.district?.id).filter(Boolean);
    return this.allDistricts.filter(d => !assignedDistrictIds.includes(d.id));
  }

  get schoolOptions() {
    return this.filteredSchools.map(s => ({label: s.name!, value: s.id}));
  }

  get districtOptions() {
    return this.filteredDistricts.map(d => ({label: d.districtName!, value: d.id}));
  }

  addToSchool(): void {
    if (!this.selectedSchoolId) return;
    this.addingSchool = true;
    this.apiService.addUserToSchool(this.selectedSchoolId, this.userId).subscribe({
      next: () => {
        this.selectedSchoolId = null;
        this.addingSchool = false;
        this.loadUser();
        this.alertService.success('User added to school');
      },
      error: (err) => {
        this.addingSchool = false;
        this.alertService.error(err.error?.message || 'Failed to add user to school');
      }
    });
  }

  removeFromSchool(schoolId: string): void {
    this.apiService.removeUserFromSchool(schoolId, this.userId).subscribe({
      next: () => {
        this.loadUser();
        this.alertService.success('User removed from school');
      },
      error: (err) => {
        this.alertService.error(err.error?.message || 'Failed to remove user from school');
      }
    });
  }

  addToDistrict(): void {
    if (!this.selectedDistrictId) return;
    this.addingDistrict = true;
    this.apiService.addUserToDistrict(this.selectedDistrictId, this.userId).subscribe({
      next: () => {
        this.selectedDistrictId = null;
        this.addingDistrict = false;
        this.loadUser();
        this.alertService.success('User added to district');
      },
      error: (err) => {
        this.addingDistrict = false;
        this.alertService.error(err.error?.message || 'Failed to add user to district');
      }
    });
  }

  removeFromDistrict(districtId: string): void {
    this.apiService.removeUserFromDistrict(districtId, this.userId).subscribe({
      next: () => {
        this.loadUser();
        this.alertService.success('User removed from district');
      },
      error: (err) => {
        this.alertService.error(err.error?.message || 'Failed to remove user from district');
      }
    });
  }

  private getAllowedAccountTypes(callerRole: AccountType): AccountType[] {
    switch (callerRole) {
      case AccountType.Admin:
        return [AccountType.Admin, AccountType.AdminStaff, AccountType.Staff, AccountType.Student];
      case AccountType.AdminStaff:
        return [AccountType.Staff, AccountType.Student];
      case AccountType.Staff:
        return [AccountType.Student];
      default:
        return [];
    }
  }

  get canChangeAccountType(): boolean {
    if (this.callerAccountType === null || !this.user) return false;
    const allowed = this.getAllowedAccountTypes(this.callerAccountType);
    return allowed.includes(this.user.accountType!);
  }

  get assignableAccountTypes(): { label: string; value: AccountType }[] {
    if (this.callerAccountType === null) return [];
    return this.getAllowedAccountTypes(this.callerAccountType).map(t => ({
      label: AccountType[t],
      value: t
    }));
  }

  saveAccountType(): void {
    if (this.selectedAccountType === null || !this.user) return;
    this.savingAccountType = true;
    this.apiService.updateAccountType(this.userId, this.selectedAccountType).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.savingAccountType = false;
        this.alertService.success('Account type updated');
      },
      error: (err) => {
        this.savingAccountType = false;
        this.alertService.error(err.error?.message || 'Failed to update account type');
      }
    });
  }
}
