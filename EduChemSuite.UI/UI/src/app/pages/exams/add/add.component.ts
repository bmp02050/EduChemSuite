import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AlertService, ApiService} from "../../../_services";
import {ExamModel} from "../../../_models/ExamModel";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {first} from "rxjs";

@Component({
    selector: 'app-add-exam',
    imports: [
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSwitchModule
],
    templateUrl: './add.component.html',
    styleUrl: './add.component.css'
})
export class AddExamComponent implements OnInit {
  examForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isTest: [false],
    });
  }

  onSubmit(): void {
    if (!this.examForm.valid) return;

    const exam: ExamModel = {
      name: this.examForm.value.name,
      description: this.examForm.value.description || undefined,
      isTest: this.examForm.value.isTest,
    } as ExamModel;

    this.apiService.createExam(exam)
      .pipe(first())
      .subscribe({
        next: (created) => {
          this.alertService.success('Exam created successfully', true);
          this.router.navigate(['/exams/edit', created.id]);
        },
        error: (err) => {
          this.alertService.error(err.error?.message || err.message || 'Failed to create exam');
        }
      });
  }
}
