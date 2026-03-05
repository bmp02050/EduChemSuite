import {Component, OnInit, OnDestroy} from '@angular/core';

import {FormsModule} from "@angular/forms";
import {ApiService} from "../../_services/api.service";
import {AlertService} from "../../_services/alert.service";
import {StorageService} from "../../_services/storage.service";
import {QuestionModel} from "../../_models/QuestionModel";
import {ExamModel} from "../../_models/ExamModel";
import {ExamQuestionModel} from "../../_models/ExamQuestionModel";
import {AccountType} from "../../_models/AccountType";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzAlertModule} from "ng-zorro-antd/alert";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {NzModalModule} from "ng-zorro-antd/modal";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzRadioModule} from "ng-zorro-antd/radio";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {concatMap, filter, from, Subject, takeUntil, toArray} from "rxjs";

@Component({
    selector: 'app-questions',
    imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzTagModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzCardModule,
    NzAlertModule,
    NzSwitchModule,
    NzModalModule,
    NzCheckboxModule,
    NzSelectModule,
    NzInputModule,
    NzRadioModule,
    NzIconModule,
    NzGridModule,
    NzStatisticModule,
    NzTooltipModule,
    NzEmptyModule,
    RouterLink
],
    templateUrl: './questions.component.html',
    styleUrl: './questions.component.css'
})
export class QuestionsComponent implements OnInit, OnDestroy {
  allQuestions: QuestionModel[] = [];
  questions: QuestionModel[] = [];
  loading = true;
  isElevatedUser = false;
  showOldVersions = false;
  toggleError: string | null = null;
  private destroy$ = new Subject<void>();

  // Selection tracking
  selectedQuestionIds = new Set<string>();
  allChecked = false;
  indeterminate = false;

  // Add to quiz modal
  addToQuizVisible = false;
  addToQuizMode: 'new' | 'existing' = 'new';
  newExamName = '';
  selectedExamId: string | null = null;
  existingExams: ExamModel[] = [];
  addingToQuiz = false;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private storageService: StorageService,
    private router: Router,
  ) {}

  ngOnInit() {
    const user = this.storageService.getUser();
    const accountType = user?.accountType;
    this.isElevatedUser = accountType === AccountType.Admin || accountType === AccountType.AdminStaff;

    this.loadQuestions();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd && (event as NavigationEnd).urlAfterRedirects === '/questions'),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadQuestions();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get stats() {
    const total = this.questions.length;
    const types = new Set(this.questions.map(q => q.questionTypeId)).size;
    const withTags = this.questions.filter(q => q.questionTags && q.questionTags.length > 0).length;
    const active = this.questions.filter(q => q.isActive).length;
    return {total, types, withTags, active};
  }

  loadQuestions() {
    this.loading = true;
    this.toggleError = null;

    this.apiService.listAllQuestions(true).subscribe({
      next: (questions) => {
        this.allQuestions = questions;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onShowOldVersionsChange() {
    this.applyFilter();
  }

  private applyFilter() {
    if (this.showOldVersions) {
      this.questions = this.allQuestions;
    } else {
      const latestMap = new Map<string, QuestionModel>();
      for (const q of this.allQuestions) {
        const key = `${q.questionText}::${q.questionTypeId}`;
        const existing = latestMap.get(key);
        if (!existing || (q.version ?? 0) > (existing.version ?? 0)) {
          latestMap.set(key, q);
        }
      }
      this.questions = Array.from(latestMap.values());
    }
    this.selectedQuestionIds.clear();
    this.refreshCheckState();
  }

  toggleActive(question: QuestionModel) {
    if (!question.id) return;
    this.toggleError = null;
    this.apiService.toggleQuestionActive(question.id).subscribe({
      next: (updated) => {
        const index = this.allQuestions.findIndex(q => q.id === question.id);
        if (index !== -1) {
          this.allQuestions[index] = updated;
          this.applyFilter();
        }
      },
      error: (err) => {
        this.toggleError = err.error?.message || 'Failed to toggle question status.';
      }
    });
  }

  deleteQuestion(id: string) {
    this.apiService.deleteQuestion(id).subscribe({
      next: () => {
        this.allQuestions = this.allQuestions.filter(q => q.id !== id);
        this.applyFilter();
      }
    });
  }

  truncate(text: string | undefined, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  // --- Selection methods ---

  onItemChecked(id: string, checked: boolean) {
    if (checked) {
      this.selectedQuestionIds.add(id);
    } else {
      this.selectedQuestionIds.delete(id);
    }
    this.refreshCheckState();
  }

  onAllChecked(checked: boolean) {
    for (const q of this.questions) {
      if (q.id) {
        if (checked) {
          this.selectedQuestionIds.add(q.id);
        } else {
          this.selectedQuestionIds.delete(q.id);
        }
      }
    }
    this.refreshCheckState();
  }

  refreshCheckState() {
    const visibleIds = this.questions.filter(q => q.id).map(q => q.id!);
    const checkedCount = visibleIds.filter(id => this.selectedQuestionIds.has(id)).length;
    this.allChecked = visibleIds.length > 0 && checkedCount === visibleIds.length;
    this.indeterminate = checkedCount > 0 && checkedCount < visibleIds.length;
  }

  // --- Add to quiz modal ---

  openAddToQuizModal() {
    this.addToQuizVisible = true;
    this.addToQuizMode = 'new';
    this.newExamName = '';
    this.selectedExamId = null;
    this.apiService.listExams().subscribe({
      next: (exams) => { this.existingExams = exams; },
      error: () => { this.existingExams = []; }
    });
  }

  get isAddToQuizDisabled(): boolean {
    if (this.addToQuizMode === 'new') {
      return !this.newExamName.trim();
    }
    return !this.selectedExamId;
  }

  confirmAddToQuiz() {
    if (this.addToQuizMode === 'new') {
      const exam = new ExamModel();
      exam.name = this.newExamName.trim();
      this.addingToQuiz = true;
      this.apiService.createExam(exam).subscribe({
        next: (created) => {
          this.addQuestionsToExam(created.id!);
        },
        error: () => {
          this.alertService.error('Failed to create exam.');
          this.addingToQuiz = false;
        }
      });
    } else {
      this.addingToQuiz = true;
      this.addQuestionsToExam(this.selectedExamId!);
    }
  }

  private addQuestionsToExam(examId: string) {
    const questionIds = Array.from(this.selectedQuestionIds);
    from(questionIds).pipe(
      concatMap(qId => {
        const eq = new ExamQuestionModel();
        eq.examId = examId;
        eq.questionId = qId;
        return this.apiService.addQuestionToExam(examId, eq);
      }),
      toArray()
    ).subscribe({
      next: () => {
        this.alertService.success(`Added ${questionIds.length} question(s) to exam.`);
        this.addToQuizVisible = false;
        this.addingToQuiz = false;
        this.selectedQuestionIds.clear();
        this.refreshCheckState();
      },
      error: () => {
        this.alertService.error('Failed to add some questions to exam.');
        this.addingToQuiz = false;
      }
    });
  }
}
