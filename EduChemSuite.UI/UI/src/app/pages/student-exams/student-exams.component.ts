import {Component, OnInit} from '@angular/core';

import {RouterLink} from '@angular/router';
import {ApiService} from '../../_services';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {NzEmptyModule} from 'ng-zorro-antd/empty';

@Component({
    selector: 'app-student-exams',
    imports: [
    RouterLink,
    NzCardModule,
    NzTableModule,
    NzSpinModule,
    NzButtonModule,
    NzTagModule,
    NzGridModule,
    NzStatisticModule,
    NzEmptyModule
],
    templateUrl: './student-exams.component.html',
    styleUrl: './student-exams.component.css'
})
export class StudentExamsComponent implements OnInit {
  exams: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadExams();
  }

  get stats() {
    const assigned = this.exams.length;
    const completed = this.exams.filter((e: any) => e.status === 'Completed').length;
    const pending = assigned - completed;
    const grades = this.exams.filter((e: any) => e.latestGrade != null).map((e: any) => e.latestGrade);
    const avgGrade = grades.length ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length) : 0;
    return {assigned, completed, pending, avgGrade};
  }

  loadExams(): void {
    this.apiService.getStudentExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  canTakeExam(exam: any): boolean {
    return exam.status !== 'Completed';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Not Started': return 'default';
      case 'In Progress': return 'orange';
      case 'Can Retake': return 'blue';
      case 'Completed': return 'green';
      default: return 'default';
    }
  }

  getTakeButtonLabel(exam: any): string {
    return exam.status === 'In Progress' ? 'Continue Exam' : 'Take Exam';
  }
}
