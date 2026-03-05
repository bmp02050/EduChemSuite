import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterLink} from "@angular/router";
import {StorageService} from "../../_services/storage.service";
import {ApiService} from "../../_services/api.service";
import {UserModel} from "../../_models/UserModel";
import {DashboardResponse} from "../../_models/DashboardModel";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzDescriptionsModule} from "ng-zorro-antd/descriptions";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzAlertModule} from "ng-zorro-antd/alert";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzEmptyModule} from "ng-zorro-antd/empty";

@Component({
    selector: 'app-welcome',
    imports: [
        CommonModule,
        RouterLink,
        NzCardModule,
        NzGridModule,
        NzTagModule,
        NzDescriptionsModule,
        NzSpinModule,
        NzStatisticModule,
        NzTableModule,
        NzAlertModule,
        NzButtonModule,
        NzEmptyModule,
    ],
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  user: UserModel | null = null;
  dashboard: DashboardResponse | null = null;
  loading = true;
  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
  ) {
  }

  ngOnInit() {
    this.user = this.storageService.getUser();

    this.apiService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get displayName(): string {
    if (!this.user) return '';
    const first = this.user.firstName;
    const last = this.user.lastName;
    if (first && last) return `${first} ${last}`;
    if (first) return first;
    return this.user.email || '';
  }

  get roleLabel(): string {
    return this.dashboard?.role || '';
  }

  get roleColor(): string {
    switch (this.dashboard?.role) {
      case 'Admin': return 'purple';
      case 'AdminStaff': return 'geekblue';
      case 'Staff': return 'blue';
      case 'Student': return 'green';
      default: return 'default';
    }
  }

  get completedExamCount(): number {
    return this.dashboard?.student?.assignedExams?.filter(e => e.isCompleted).length ?? 0;
  }
}
