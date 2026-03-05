import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {ApiService} from "../../_services/api.service";
import {ExamModel} from "../../_models/ExamModel";
import {GradeModel} from "../../_models/GradeModel";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzStatisticModule} from "ng-zorro-antd/statistic";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {NzEmptyModule} from "ng-zorro-antd/empty";

@Component({
    selector: 'app-grades',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        NzTableModule,
        NzButtonModule,
        NzSpinModule,
        NzSelectModule,
        NzPopconfirmModule,
        NzCardModule,
        NzGridModule,
        NzStatisticModule,
        NzIconModule,
        NzTooltipModule,
        NzEmptyModule,
    ],
    templateUrl: './grades.component.html',
    styleUrl: './grades.component.css'
})
export class GradesComponent implements OnInit {
  exams: ExamModel[] = [];
  grades: GradeModel[] = [];
  selectedExamId: string | null = null;
  loading = false;
  examsLoading = true;

  get examOptions() {
    return this.exams.map(e => ({label: e.name || '', value: e.id}));
  }

  get stats() {
    const total = this.grades.length;
    const values = this.grades.map(g => g.gradeValue || 0);
    const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const highest = values.length ? Math.max(...values) : 0;
    const lowest = values.length ? Math.min(...values) : 0;
    return {total, avg, highest, lowest};
  }

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.examsLoading = true;
    this.apiService.listExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.examsLoading = false;
      },
      error: () => { this.examsLoading = false; }
    });
  }

  onExamChange(examId: string) {
    this.selectedExamId = examId;
    if (!examId) {
      this.grades = [];
      return;
    }
    this.loading = true;
    this.apiService.listGradesByExam(examId).subscribe({
      next: (grades) => {
        this.grades = grades;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  deleteGrade(id: string) {
    this.apiService.deleteGrade(id).subscribe({
      next: () => {
        this.grades = this.grades.filter(g => g.id !== id);
      }
    });
  }

  getExamName(examId: string | undefined): string {
    if (!examId) return '';
    const exam = this.exams.find(e => e.id === examId);
    return exam?.name || '';
  }
}
