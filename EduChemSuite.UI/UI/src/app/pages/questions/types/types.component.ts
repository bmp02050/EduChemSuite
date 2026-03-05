import {Component, OnInit} from '@angular/core';

import {FormsModule} from "@angular/forms";
import {ApiService} from "../../../_services/api.service";
import {QuestionTypeModel} from "../../../_models/QuestionTypeModel";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {AlertService} from "../../../_services";

@Component({
    selector: 'app-question-types',
    imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSpinModule,
    NzCardModule,
    NzIconModule,
    NzTooltipModule
],
    templateUrl: './types.component.html',
    styleUrl: './types.component.css'
})
export class QuestionTypesComponent implements OnInit {
  questionTypes: QuestionTypeModel[] = [];
  loading = true;
  newDescription = '';
  editingId: string | null = null;
  editDescription = '';

  constructor(private apiService: ApiService, private alertService: AlertService) {}

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.loading = true;
    this.apiService.listQuestionTypes().subscribe({
      next: (types) => {
        this.questionTypes = types;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  addType() {
    if (!this.newDescription.trim()) return;
    this.apiService.createQuestionType({description: this.newDescription} as QuestionTypeModel).subscribe({
      next: () => {
        this.newDescription = '';
        this.loadTypes();
        this.alertService.success('Question type created');
      },
      error: () => this.alertService.error('Failed to create question type')
    });
  }

  startEdit(qt: QuestionTypeModel) {
    this.editingId = qt.id!;
    this.editDescription = qt.description!;
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(qt: QuestionTypeModel) {
    this.apiService.updateQuestionType(qt.id!, {...qt, description: this.editDescription} as QuestionTypeModel).subscribe({
      next: () => {
        this.editingId = null;
        this.loadTypes();
        this.alertService.success('Question type updated');
      },
      error: () => this.alertService.error('Failed to update question type')
    });
  }
}
