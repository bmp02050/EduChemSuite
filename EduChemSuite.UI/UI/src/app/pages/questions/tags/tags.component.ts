import {Component, OnInit} from '@angular/core';

import {FormsModule} from "@angular/forms";
import {ApiService} from "../../../_services/api.service";
import {TagModel} from "../../../_models/TagModel";
import {NzTableModule} from "ng-zorro-antd/table";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzTooltipModule} from "ng-zorro-antd/tooltip";
import {AlertService} from "../../../_services";

@Component({
    selector: 'app-tags',
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
    templateUrl: './tags.component.html',
    styleUrl: './tags.component.css'
})
export class TagsComponent implements OnInit {
  tags: TagModel[] = [];
  loading = true;
  newTagText = '';
  editingId: string | null = null;
  editTagText = '';

  constructor(private apiService: ApiService, private alertService: AlertService) {}

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.loading = true;
    this.apiService.listTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  addTag() {
    if (!this.newTagText.trim()) return;
    this.apiService.createTag({tagText: this.newTagText} as TagModel).subscribe({
      next: () => {
        this.newTagText = '';
        this.loadTags();
        this.alertService.success('Tag created');
      },
      error: () => this.alertService.error('Failed to create tag')
    });
  }

  startEdit(tag: TagModel) {
    this.editingId = tag.id!;
    this.editTagText = tag.tagText!;
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(tag: TagModel) {
    this.apiService.updateTag(tag.id!, {...tag, tagText: this.editTagText} as TagModel).subscribe({
      next: () => {
        this.editingId = null;
        this.loadTags();
        this.alertService.success('Tag updated');
      },
      error: () => this.alertService.error('Failed to update tag')
    });
  }
}
