import {Component, OnInit} from '@angular/core';

import {ApiService} from "../../_services/api.service";
import {AlertService} from "../../_services";
import {DistrictModel} from "../../_models/DistrictModel";
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
import {AlertComponent} from "../../_components";

@Component({
    selector: 'app-districts',
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
    RouterLink,
    AlertComponent
],
    templateUrl: './districts.component.html',
    styleUrl: './districts.component.css'
})
export class DistrictsComponent implements OnInit {
  districts: DistrictModel[] = [];
  loading = true;

  get stats() {
    const total = this.districts.length;
    const totalSchools = this.districts.reduce((sum, d) => sum + (d.schools?.length || 0), 0);
    const totalAdmins = this.districts.reduce((sum, d) => sum + (d.administrators?.length || 0), 0);
    const active = this.districts.filter(d => d.isActive).length;
    return {total, totalSchools, totalAdmins, active};
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.loadDistricts();
  }

  loadDistricts() {
    this.loading = true;
    this.apiService.listAllDistricts().subscribe({
      next: (districts) => {
        this.districts = districts;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message || 'Failed to load districts.';
        this.alertService.error(message);
      }
    });
  }

  deleteDistrict(id: string) {
    this.apiService.deleteDistrict(id).subscribe({
      next: () => {
        this.districts = this.districts.filter(d => d.id !== id);
        this.alertService.success('District deleted successfully.');
      },
      error: (err) => {
        const message = err.error?.message || 'Failed to delete district.';
        this.alertService.error(message);
      }
    });
  }
}
