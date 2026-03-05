import {Component, OnInit} from '@angular/core';

import {FormsModule} from "@angular/forms";
import {ApiService} from "../../_services/api.service";
import {ImageTypeModel} from "../../_models/ImageTypeModel";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzCardModule} from "ng-zorro-antd/card";
import {AlertService} from "../../_services";

@Component({
    selector: 'app-answers',
    imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSpinModule,
    NzCardModule
],
    templateUrl: './answers.component.html',
    styleUrl: './answers.component.css'
})
export class AnswersComponent implements OnInit {
  imageTypes: ImageTypeModel[] = [];
  loading = true;
  newDescription = '';
  editingId: string | null = null;
  editDescription = '';

  constructor(private apiService: ApiService, private alertService: AlertService) {}

  ngOnInit() {
    this.loadImageTypes();
  }

  loadImageTypes() {
    this.loading = true;
    this.apiService.listImageTypes().subscribe({
      next: (types) => {
        this.imageTypes = types;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  addType() {
    if (!this.newDescription.trim()) return;
    this.apiService.createImageType({description: this.newDescription} as ImageTypeModel).subscribe({
      next: () => {
        this.newDescription = '';
        this.loadImageTypes();
        this.alertService.success('Image type created');
      },
      error: () => this.alertService.error('Failed to create image type')
    });
  }

  startEdit(it: ImageTypeModel) {
    this.editingId = it.id!;
    this.editDescription = it.description!;
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(it: ImageTypeModel) {
    this.apiService.updateImageType(it.id!, {...it, description: this.editDescription} as ImageTypeModel).subscribe({
      next: () => {
        this.editingId = null;
        this.loadImageTypes();
        this.alertService.success('Image type updated');
      },
      error: () => this.alertService.error('Failed to update image type')
    });
  }
}
