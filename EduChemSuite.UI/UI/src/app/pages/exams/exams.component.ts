import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ApiService} from "../../_services/api.service";
import {StorageService} from "../../_services/storage.service";
import {ExamModel} from "../../_models/ExamModel";
import {AccountType} from "../../_models/AccountType";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzAlertModule} from "ng-zorro-antd/alert";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {filter, Subject, takeUntil} from "rxjs";

@Component({
    selector: 'app-exams',
    imports: [
        CommonModule,
        NzTableModule,
        NzButtonModule,
        NzTagModule,
        NzSpinModule,
        NzPopconfirmModule,
        NzCardModule,
        NzAlertModule,
        NzGridModule,
        NzStatisticModule,
        NzIconModule,
        NzTooltipModule,
        NzEmptyModule,
        RouterLink,
    ],
    templateUrl: './exams.component.html',
    styleUrl: './exams.component.css'
})
export class ExamsComponent implements OnInit, OnDestroy {
  exams: ExamModel[] = [];
  loading = true;
  isElevatedUser = false;
  toggleError: string | null = null;
  private destroy$ = new Subject<void>();

  get stats() {
    const total = this.exams.length;
    const active = this.exams.filter(e => e.isActive).length;
    const inactive = this.exams.filter(e => !e.isActive).length;
    const totalQuestions = this.exams.reduce((sum, e) => sum + (e.examQuestions?.length || 0), 0);
    return {total, active, inactive, totalQuestions};
  }

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router,
  ) {}

  ngOnInit() {
    const user = this.storageService.getUser();
    const accountType = user?.accountType;
    this.isElevatedUser = accountType === AccountType.Admin || accountType === AccountType.AdminStaff;

    this.loadExams();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && (event as NavigationEnd).urlAfterRedirects === '/exams'),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadExams();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExams() {
    this.loading = true;
    this.toggleError = null;
    this.apiService.listAllExams(true).subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  toggleActive(exam: ExamModel) {
    if (!exam.id) return;
    this.toggleError = null;
    this.apiService.toggleExamActive(exam.id).subscribe({
      next: (updated) => {
        const index = this.exams.findIndex(e => e.id === exam.id);
        if (index !== -1) {
          this.exams[index] = updated;
        }
      },
      error: (err) => {
        this.toggleError = err.error?.message || 'Failed to toggle exam status.';
      }
    });
  }

  deleteExam(id: string) {
    this.apiService.deleteExam(id).subscribe({
      next: () => {
        this.exams = this.exams.filter(e => e.id !== id);
      }
    });
  }

  truncate(text: string | undefined, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
}
