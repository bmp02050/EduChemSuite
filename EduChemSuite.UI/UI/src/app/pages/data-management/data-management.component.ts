import {Component} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzUploadModule, NzUploadFile} from 'ng-zorro-antd/upload';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {ApiService} from '../../_services/api.service';
import {AlertService} from '../../_services/alert.service';
import {SearchFilterComponent} from '../../_components/search-filter/search-filter.component';
import {SearchQueryModel} from '../../_models/SearchQueryModel';
import {ImportResultModel} from '../../_models/ImportResultModel';
import {downloadBlob} from '../../_helpers/file-download.helper';
import {AlertComponent} from '../../_components/alert/alert.component';

@Component({
    selector: 'app-data-management',
    imports: [
    FormsModule,
    NzTabsModule,
    NzSelectModule,
    NzButtonModule,
    NzUploadModule,
    NzTableModule,
    NzCardModule,
    NzSpinModule,
    NzAlertModule,
    NzIconModule,
    NzTagModule,
    SearchFilterComponent,
    AlertComponent
],
    templateUrl: './data-management.component.html',
    styleUrls: ['./data-management.component.css']
})
export class DataManagementComponent {
  entityTypes = [
    {value: 'districts', label: 'Districts'},
    {value: 'schools', label: 'Schools'},
    {value: 'users', label: 'Users'},
    {value: 'questions', label: 'Questions'},
    {value: 'answers', label: 'Answers'},
    {value: 'grades', label: 'Grades'},
  ];

  exportEntityTypes = [
    {value: 'users', label: 'Users'},
    {value: 'districts', label: 'Districts'},
    {value: 'schools', label: 'Schools'},
    {value: 'questions', label: 'Questions'},
    {value: 'exams', label: 'Exams'},
    {value: 'grades', label: 'Grades'},
    {value: 'exam-responses', label: 'Exam Responses'},
  ];

  // Import state
  importEntityType = 'districts';
  importLoading = false;
  importResult: ImportResultModel | null = null;

  // Export state
  exportEntityType = 'users';
  exportLoading = false;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  // Import methods
  downloadTemplate(): void {
    this.apiService.downloadImportTemplate(this.importEntityType).subscribe({
      next: (blob) => downloadBlob(blob, `${this.importEntityType}-template.csv`),
      error: (err) => this.alertService.error(err.error?.message || 'Failed to download template')
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.importLoading = true;
    this.importResult = null;
    this.apiService.importCsv(this.importEntityType, file as any).subscribe({
      next: (result) => {
        this.importResult = result;
        this.importLoading = false;
        if (result.errorCount === 0) {
          this.alertService.success(`Import complete: ${result.createdCount} created, ${result.updatedCount} updated`);
        } else {
          this.alertService.error(`Import complete with ${result.errorCount} errors`);
        }
      },
      error: (err) => {
        this.importLoading = false;
        this.alertService.error(err.error?.message || 'Import failed');
      }
    });
    return false;
  };

  // Export methods
  onExport(query: SearchQueryModel): void {
    this.exportLoading = true;
    const exportFn = this.getExportFn(this.exportEntityType);
    exportFn(query).subscribe({
      next: (blob: Blob) => {
        downloadBlob(blob, `${this.exportEntityType}.csv`);
        this.exportLoading = false;
        this.alertService.success('Export downloaded successfully');
      },
      error: (err: any) => {
        this.exportLoading = false;
        this.alertService.error(err.error?.message || 'Export failed');
      }
    });
  }

  private getExportFn(entityType: string): (query: SearchQueryModel) => any {
    const map: Record<string, (q: SearchQueryModel) => any> = {
      'users': (q) => this.apiService.exportUsers(q),
      'districts': (q) => this.apiService.exportDistricts(q),
      'schools': (q) => this.apiService.exportSchools(q),
      'questions': (q) => this.apiService.exportQuestions(q),
      'exams': (q) => this.apiService.exportExams(q),
      'grades': (q) => this.apiService.exportGrades(q),
      'exam-responses': (q) => this.apiService.exportExamResponses(q),
    };
    return map[entityType];
  }
}
