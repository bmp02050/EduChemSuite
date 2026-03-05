import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {ApiService} from '../../../_services/api.service';
import {SignalRService} from '../../../_services/signalr.service';
import {MessageModel} from '../../../_models/MessageModel';

@Component({
    selector: 'app-inbox',
    imports: [CommonModule, RouterLink, NzTableModule, NzButtonModule, NzTagModule, NzCardModule, NzEmptyModule, NzIconModule, NzGridModule, NzStatisticModule],
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit, OnDestroy {
  messages: MessageModel[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private signalRService: SignalRService
  ) {}

  get stats() {
    const total = this.messages.length;
    const unread = this.messages.filter(m => !m.isRead).length;
    return {total, unread};
  }

  ngOnInit(): void {
    this.loadInbox();

    this.signalRService.messageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.messages = [message, ...this.messages];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInbox(): void {
    this.loading = true;
    this.apiService.getInbox().subscribe({
      next: messages => {
        this.messages = messages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteMessage(id: string, event: Event): void {
    event.stopPropagation();
    this.apiService.deleteMessage(id).subscribe(() => {
      this.messages = this.messages.filter(m => m.id !== id);
    });
  }
}
