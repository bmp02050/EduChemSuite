import {Component, OnInit} from '@angular/core';

import {ActivatedRoute, RouterLink} from '@angular/router';
import {AlertService, ApiService} from '../../../_services';
import {isDiagramQuestion as isDiagram, isAtomicStructureQuestion as isAtomicStructure, isChemicalEquationQuestion, isElectronConfigQuestion, isLewisStructureQuestion, isPeriodicTableQuestion, isStoichiometryQuestion} from '../../../_helpers';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {AlertComponent} from '../../../_components';
import {MoleculeCompareComponent} from 'molecule-builder';
import {AtomCompareComponent} from 'atom-builder';
import {EquationCompareComponent} from 'equation-balancer';
import {ElectronConfigCompareComponent} from 'electron-config';
import {PeriodicTableCompareComponent} from 'periodic-table-quiz';
import {StoichiometryCompareComponent} from 'stoichiometry-stepper';
import {first} from 'rxjs';

interface StudentSummary {
  userId: string;
  user: { firstName?: string; lastName?: string; email?: string } | null;
  responses: any[];
  totalCount: number;
  gradedCount: number;
  correctCount: number;
  pendingCount: number;
  grade: number;
}

@Component({
    selector: 'app-review-exam',
    imports: [
    RouterLink,
    NzCardModule,
    NzTableModule,
    NzSpinModule,
    NzTagModule,
    NzButtonModule,
    NzPopconfirmModule,
    AlertComponent,
    MoleculeCompareComponent,
    AtomCompareComponent,
    EquationCompareComponent,
    ElectronConfigCompareComponent,
    PeriodicTableCompareComponent,
    StoichiometryCompareComponent,
],
    templateUrl: './review.component.html',
    styleUrl: './review.component.css'
})
export class ReviewExamComponent implements OnInit {
  examId!: string;
  loading = true;
  students: StudentSummary[] = [];
  selectedStudent: StudentSummary | null = null;
  grading = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id')!;
    this.loadReview();
  }

  loadReview(): void {
    this.loading = true;
    this.apiService.getExamReview(this.examId).subscribe({
      next: (data) => {
        this.students = data;
        if (this.selectedStudent) {
          this.selectedStudent = this.students.find(s => s.userId === this.selectedStudent!.userId) || null;
        }
        this.loading = false;
      },
      error: () => {
        this.alertService.error('Failed to load exam review data');
        this.loading = false;
      }
    });
  }

  selectStudent(student: StudentSummary): void {
    this.selectedStudent = student;
  }

  backToList(): void {
    this.selectedStudent = null;
  }

  gradeResponse(responseId: string, isCorrect: boolean): void {
    this.grading = true;
    this.apiService.gradeExamResponse(responseId, isCorrect).pipe(first()).subscribe({
      next: () => {
        this.alertService.success(isCorrect ? 'Marked as correct' : 'Marked as incorrect');
        this.grading = false;
        this.loadReview();
      },
      error: () => {
        this.alertService.error('Failed to grade response');
        this.grading = false;
      }
    });
  }

  getStatusColor(response: any): string {
    if (!response.isGraded) return 'orange';
    return response.isCorrect ? 'green' : 'red';
  }

  getStatusText(response: any): string {
    if (!response.isGraded) return 'Pending';
    return response.isCorrect ? 'Correct' : 'Incorrect';
  }

  getResponseDisplay(response: any): string {
    if (response.answer?.answerText) return response.answer.answerText;
    if (response.responseText) return response.responseText;
    if (response.responseImage) return '[Image Response]';
    return '[No Response]';
  }

  isDiagramQuestion(response: any): boolean {
    return isDiagram(response?.question?.questionType?.description);
  }

  isAtomicStructureQuestion(response: any): boolean {
    return isAtomicStructure(response?.question?.questionType?.description);
  }

  isChemicalEquation(response: any): boolean {
    return isChemicalEquationQuestion(response?.question?.questionType?.description);
  }

  isElectronConfig(response: any): boolean {
    return isElectronConfigQuestion(response?.question?.questionType?.description);
  }

  isPeriodicTable(response: any): boolean {
    return isPeriodicTableQuestion(response?.question?.questionType?.description);
  }

  isLewisStructure(response: any): boolean {
    return isLewisStructureQuestion(response?.question?.questionType?.description);
  }

  isStoichiometry(response: any): boolean {
    return isStoichiometryQuestion(response?.question?.questionType?.description);
  }

  isToolQuestion(response: any): boolean {
    return this.isDiagramQuestion(response) || this.isAtomicStructureQuestion(response) ||
      this.isLewisStructure(response) ||
      this.isChemicalEquation(response) || this.isElectronConfig(response) ||
      this.isPeriodicTable(response) || this.isStoichiometry(response);
  }

  getCorrectDiagramJson(response: any): string | null {
    const correct = response?.question?.answers?.find((a: any) => a.isCorrect);
    return correct?.answerText ?? null;
  }
}
