import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {ApiService} from '../../../_services/api.service';
import {MessageModel} from '../../../_models/MessageModel';

@Component({
    selector: 'app-sent',
    imports: [CommonModule, RouterLink, NzTableModule, NzButtonModule, NzTagModule, NzCardModule, NzEmptyModule, NzIconModule, NzGridModule, NzStatisticModule],
    templateUrl: './sent.component.html',
    styleUrls: ['./sent.component.css']
})
export class SentComponent implements OnInit {
  messages: MessageModel[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  get stats() {
    return { total: this.messages.length };
  }

  ngOnInit(): void {
    this.loadSent();
  }

  loadSent(): void {
    this.loading = true;
    this.apiService.getSentMessages().subscribe({
      next: messages => {
        this.messages = messages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
