import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {ExamModel} from "../../../_models/ExamModel";
import {ExamQuestionModel} from "../../../_models/ExamQuestionModel";
import {ExamAssignmentModel} from "../../../_models/ExamAssignmentModel";
import {QuestionModel} from "../../../_models/QuestionModel";
import {UserModel} from "../../../_models/UserModel";
import {AccountType} from "../../../_models/AccountType";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzInputNumberModule} from "ng-zorro-antd/input-number";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {NzIconModule} from "ng-zorro-antd/icon";
import {AlertComponent} from "../../../_components";
import {first} from "rxjs";

@Component({
    selector: 'app-edit-exam',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterLink,
        NzFormModule,
        NzInputModule,
        NzInputNumberModule,
        NzButtonModule,
        NzSelectModule,
        NzTableModule,
        NzSpinModule,
        NzSwitchModule,
        NzPopconfirmModule,
        NzCardModule,
        NzTooltipModule,
        NzIconModule,
        AlertComponent,
    ],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.css'
})
export class EditExamComponent implements OnInit {
  examForm!: FormGroup;
  exam: ExamModel | null = null;
  examId!: string;
  loading = true;
  examQuestions: ExamQuestionModel[] = [];
  allQuestions: QuestionModel[] = [];
  selectedQuestionId: string | null = null;
  assignments: ExamAssignmentModel[] = [];
  allStudents: UserModel[] = [];
  selectedStudentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id')!;
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      timeLimitMinutes: [null as number | null],
      allowRetakes: [false],
      maxAttempts: [1],
      isTest: [false],
      strictDiagramGrading: [false],
    });

    this.loadExam();
    this.loadAllQuestions();
    this.loadAllStudents();
  }

  loadExam(): void {
    this.apiService.getExam(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.examForm.patchValue({
          name: exam.name,
          description: exam.description,
          timeLimitMinutes: exam.timeLimitMinutes ?? null,
          allowRetakes: exam.allowRetakes ?? false,
          maxAttempts: exam.maxAttempts ?? 1,
          isTest: exam.isTest ?? false,
          strictDiagramGrading: exam.strictDiagramGrading ?? false,
        });
        this.loadExamQuestions();
        this.loadAssignments();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alertService.error(err.error?.message || 'Failed to load exam');
      }
    });
  }

  loadExamQuestions(): void {
    this.apiService.listExamQuestions(this.examId).subscribe({
      next: (questions) => {
        this.examQuestions = questions;
      }
    });
  }

  loadAllQuestions(): void {
    this.apiService.listAllQuestions(true).subscribe({
      next: (questions) => {
        this.allQuestions = questions;
      }
    });
  }

  loadAssignments(): void {
    this.apiService.listExamAssignments(this.examId).subscribe({
      next: (assignments) => this.assignments = assignments,
    });
  }

  loadAllStudents(): void {
    this.apiService.listAllUsers().subscribe({
      next: (users) => this.allStudents = users.filter(u =>
        u.accountType === AccountType.Student
      ),
    });
  }

  get availableStudents(): UserModel[] {
    const assignedIds = new Set(this.assignments.map(a => a.userId));
    return this.allStudents.filter(s => !assignedIds.has(s.id));
  }

  assignStudent(): void {
    if (!this.selectedStudentId) return;
    this.apiService.assignExamToStudent(this.examId, this.selectedStudentId).pipe(first()).subscribe({
      next: () => {
        this.selectedStudentId = null;
        this.loadAssignments();
        this.alertService.success('Student assigned to exam');
      },
      error: (err) => this.alertService.error(err?.error?.message || 'Failed to assign student')
    });
  }

  unassignStudent(userId: string): void {
    this.apiService.unassignExamFromStudent(this.examId, userId).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(a => a.userId !== userId);
        this.alertService.success('Student unassigned from exam');
      },
      error: () => this.alertService.error('Failed to unassign student')
    });
  }

  get availableQuestions(): QuestionModel[] {
    const assignedIds = new Set(this.examQuestions.map(eq => eq.questionId));
    return this.allQuestions.filter(q => !assignedIds.has(q.id));
  }

  get questionOptions() {
    return this.availableQuestions.map(q => ({
      label: q.questionText || '',
      value: q.id
    }));
  }

  get studentOptions() {
    return this.availableStudents.map(s => ({
      label: `${s.firstName || ''} ${s.lastName || ''} (${s.email || ''})`,
      value: s.id
    }));
  }

  addQuestion(): void {
    if (!this.selectedQuestionId) return;
    const eq: ExamQuestionModel = {
      examId: this.examId,
      questionId: this.selectedQuestionId,
    } as ExamQuestionModel;

    this.apiService.addQuestionToExam(this.examId, eq).pipe(first()).subscribe({
      next: () => {
        this.selectedQuestionId = null;
        this.loadExamQuestions();
        this.alertService.success('Question added to exam');
      },
      error: () => this.alertService.error('Failed to add question')
    });
  }

  removeQuestion(examQuestionId: string): void {
    this.apiService.removeQuestionFromExam(this.examId, examQuestionId).subscribe({
      next: () => {
        this.examQuestions = this.examQuestions.filter(eq => eq.id !== examQuestionId);
        this.alertService.success('Question removed from exam');
      },
      error: () => this.alertService.error('Failed to remove question')
    });
  }

  isDiagramQuestion(eq: ExamQuestionModel): boolean {
    const desc = eq.question?.questionType?.description?.toLowerCase() || '';
    return desc.includes('chemical structure') || desc.includes('diagram') || desc.includes('molecule');
  }

  updateAngleTolerance(eq: ExamQuestionModel, value: number | null): void {
    if (!eq.id || !eq.examId) return;
    const updated: ExamQuestionModel = {
      ...eq,
      angleTolerancePercent: value,
    };
    this.apiService.updateExamQuestion(this.examId, eq.id, updated).pipe(first()).subscribe({
      next: (result) => {
        const idx = this.examQuestions.findIndex(q => q.id === eq.id);
        if (idx !== -1) this.examQuestions[idx] = result;
        this.alertService.success('Angle tolerance updated');
      },
      error: () => this.alertService.error('Failed to update angle tolerance')
    });
  }

  onSubmit(): void {
    if (!this.examForm.valid || !this.exam) return;

    const updated: ExamModel = {
      id: this.exam.id,
      isActive: this.exam.isActive,
      name: this.examForm.value.name,
      description: this.examForm.value.description,
      timeLimitMinutes: this.examForm.value.timeLimitMinutes || null,
      allowRetakes: this.examForm.value.allowRetakes,
      maxAttempts: this.examForm.value.maxAttempts,
      isTest: this.examForm.value.isTest,
      strictDiagramGrading: this.examForm.value.strictDiagramGrading,
    } as ExamModel;

    this.apiService.updateExam(this.examId, updated)
      .pipe(first())
      .subscribe({
        next: (result) => {
          this.exam = result;
          this.alertService.success('Exam updated successfully');
        },
        error: (err) => {
          this.alertService.error(err.error?.message || err.message || 'Failed to update exam');
        }
      });
  }
}
