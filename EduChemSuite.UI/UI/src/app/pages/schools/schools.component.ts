import {Component, OnInit} from '@angular/core';

import {ApiService} from "../../_services/api.service";
import {SchoolModel} from "../../_models/SchoolModel";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-schools',
    imports: [
    NzTableModule,
    NzButtonModule,
    NzTagModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    NzTooltipModule,
    NzEmptyModule,
    RouterLink
],
    templateUrl: './schools.component.html',
    styleUrl: './schools.component.css'
})
export class SchoolsComponent implements OnInit {
  schools: SchoolModel[] = [];
  loading = true;

  get stats() {
    const total = this.schools.length;
    const totalStaff = this.schools.reduce((sum, s) => sum + (s.staff?.length || 0), 0);
    const totalStudents = this.schools.reduce((sum, s) => sum + (s.students?.length || 0), 0);
    const active = this.schools.filter(s => s.isActive).length;
    return {total, totalStaff, totalStudents, active};
  }

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSchools();
  }

  loadSchools() {
    this.loading = true;
    this.apiService.listAllSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteSchool(id: string) {
    this.apiService.deleteSchool(id).subscribe({
      next: () => {
        this.schools = this.schools.filter(s => s.id !== id);
      }
    });
  }
}
