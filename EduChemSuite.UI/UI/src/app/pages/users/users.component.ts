import {Component, OnInit} from '@angular/core';

import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../_services/api.service";
import {UserModel} from "../../_models/UserModel";
import {DistrictModel} from "../../_models/DistrictModel";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {AccountType} from "../../_models/AccountType";

@Component({
    selector: 'app-users',
    imports: [
    FormsModule,
    NzTableModule,
    NzSelectModule,
    NzButtonModule,
    NzTagModule,
    NzEmptyModule,
    NzSpinModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    NzTooltipModule,
    RouterLink
],
    templateUrl: './users.component.html',
    styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  districts: DistrictModel[] = [];
  selectedDistrictId: string | null = null;
  selectedAccountType: string | null = null;
  allUsers: UserModel[] = [];
  users: UserModel[] = [];
  loadingDistricts = true;
  loadingUsers = false;
  pageTitle = 'Users';

  accountTypeOptions = [
    {label: 'All', value: null},
    {label: 'Admin', value: 'Admin'},
    {label: 'Admin Staff', value: 'AdminStaff'},
    {label: 'Staff', value: 'Staff'},
    {label: 'Student', value: 'Student'},
  ];

  get districtOptions() {
    return this.districts.map(d => ({label: d.districtName || d.id!, value: d.id}));
  }

  get stats() {
    const total = this.users.length;
    const admins = this.users.filter(u => u.accountType === AccountType.Admin).length;
    const staff = this.users.filter(u => u.accountType === AccountType.Staff || u.accountType === AccountType.AdminStaff).length;
    const students = this.users.filter(u => u.accountType === AccountType.Student).length;
    return {total, admins, staff, students};
  }

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    const typeParam = this.route.snapshot.queryParams['accountType'];
    if (typeParam) {
      this.selectedAccountType = typeParam;
      this.pageTitle = typeParam + 's';
    }

    this.apiService.listAllDistricts().subscribe({
      next: (districts) => {
        this.districts = districts;
        this.loadingDistricts = false;
      },
      error: () => {
        this.loadingDistricts = false;
      }
    });
  }

  onDistrictChange(districtId: string) {
    this.selectedDistrictId = districtId;
    if (!districtId) {
      this.allUsers = [];
      this.users = [];
      return;
    }
    this.loadingUsers = true;
    this.apiService.listUsersByDistrict(districtId).subscribe({
      next: (users) => {
        this.allUsers = users;
        this.applyAccountTypeFilter();
        this.loadingUsers = false;
      },
      error: () => {
        this.allUsers = [];
        this.users = [];
        this.loadingUsers = false;
      }
    });
  }

  onAccountTypeChange() {
    this.applyAccountTypeFilter();
  }

  private applyAccountTypeFilter() {
    if (!this.selectedAccountType) {
      this.users = this.allUsers;
      return;
    }
    const filterValue = AccountType[this.selectedAccountType as keyof typeof AccountType];
    this.users = this.allUsers.filter(u => u.accountType === filterValue);
  }

  getAccountTypeLabel(type: AccountType | undefined): string {
    if (type === undefined || type === null) return 'Unknown';
    return AccountType[type] || 'Unknown';
  }
}
