import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {SearchQueryModel} from '../../_models/SearchQueryModel';
import {ApiService} from '../../_services/api.service';
import {DistrictModel} from '../../_models/DistrictModel';
import {SchoolModel} from '../../_models/SchoolModel';

@Component({
    selector: 'app-search-filter',
    imports: [
    FormsModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzButtonModule,
    NzCheckboxModule,
    NzGridModule,
    NzIconModule
],
    templateUrl: './search-filter.component.html',
    styleUrls: ['./search-filter.component.css']
})
export class SearchFilterComponent implements OnInit {
  @Input() showSearchText = true;
  @Input() showDistrict = true;
  @Input() showSchool = true;
  @Input() showAccountType = false;
  @Input() showTeacher = false;
  @Input() showStudent = false;
  @Input() showExam = false;
  @Input() showDateRange = true;
  @Input() showGradeRange = false;
  @Input() showExportButton = true;
  @Input() showIncludeInactive = true;

  @Output() search = new EventEmitter<SearchQueryModel>();
  @Output() export = new EventEmitter<SearchQueryModel>();

  searchText = '';
  districtId: string | null = null;
  schoolId: string | null = null;
  accountType: string | null = null;
  dateRange: Date[] = [];
  gradeMin: number | null = null;
  gradeMax: number | null = null;
  includeInactive = false;

  districts: DistrictModel[] = [];
  schools: SchoolModel[] = [];
  accountTypes = ['Admin', 'AdminStaff', 'Staff', 'Student'];

  get districtOptions() {
    return this.districts.map(d => ({label: d.districtName || '', value: d.id}));
  }

  get schoolOptions() {
    return this.schools.map(s => ({label: s.name || '', value: s.id}));
  }

  get accountTypeOptionsList() {
    return this.accountTypes.map(t => ({label: t, value: t}));
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.showDistrict) {
      this.apiService.listAllDistricts().subscribe({
        next: (districts) => this.districts = districts
      });
    }
    if (this.showSchool) {
      this.apiService.listAllSchools().subscribe({
        next: (schools) => this.schools = schools
      });
    }
  }

  buildQuery(): SearchQueryModel {
    const query: SearchQueryModel = {page: 1, pageSize: 10};
    if (this.searchText) query.searchText = this.searchText;
    if (this.districtId) query.districtId = this.districtId;
    if (this.schoolId) query.schoolId = this.schoolId;
    if (this.accountType) query.accountType = this.accountType;
    if (this.dateRange?.length === 2) {
      query.dateFrom = this.dateRange[0].toISOString();
      query.dateTo = this.dateRange[1].toISOString();
    }
    if (this.gradeMin != null) query.gradeMin = this.gradeMin;
    if (this.gradeMax != null) query.gradeMax = this.gradeMax;
    if (this.includeInactive) query.includeInactive = true;
    return query;
  }

  onSearch(): void {
    this.search.emit(this.buildQuery());
  }

  onExport(): void {
    this.export.emit(this.buildQuery());
  }

  onReset(): void {
    this.searchText = '';
    this.districtId = null;
    this.schoolId = null;
    this.accountType = null;
    this.dateRange = [];
    this.gradeMin = null;
    this.gradeMax = null;
    this.includeInactive = false;
    this.onSearch();
  }
}
