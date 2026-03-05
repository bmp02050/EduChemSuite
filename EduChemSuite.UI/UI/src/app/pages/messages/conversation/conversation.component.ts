import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {ApiService} from '../../../_services/api.service';
import {SignalRService} from '../../../_services/signalr.service';
import {AlertService} from '../../../_services/alert.service';
import {StorageService} from '../../../_services/storage.service';
import {MessageModel} from '../../../_models/MessageModel';

@Component({
    selector: 'app-conversation',
    imports: [CommonModule, FormsModule, RouterLink, NzCardModule, NzListModule, NzButtonModule, NzInputModule, NzTagModule, NzIconModule, NzDividerModule],
    templateUrl: './conversation.component.html',
    styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, OnDestroy {
  conversationId = '';
  messages: MessageModel[] = [];
  loading = true;
  replyBody = '';
  sending = false;
  currentUserId = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private signalRService: SignalRService,
    private alertService: AlertService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.currentUserId = user?.id || '';

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.conversationId = params['id'];
      this.loadConversation();
    });

    this.signalRService.messageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message.conversationId === this.conversationId) {
          this.messages = [...this.messages, message];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversation(): void {
    this.loading = true;
    this.apiService.getConversation(this.conversationId).subscribe({
      next: messages => {
        this.messages = messages;
        this.loading = false;
        // Mark conversation as read
        this.apiService.markConversationAsRead(this.conversationId).subscribe();
      },
      error: () => this.loading = false
    });
  }

  sendReply(): void {
    if (!this.replyBody.trim()) return;

    const firstMsg = this.messages[0];
    if (!firstMsg) return;

    this.sending = true;
    // Find the unique participants that are not the current user
    const participantIds = [...new Set(
      this.messages
        .map(m => m.senderId === this.currentUserId ? m.recipientId : m.senderId)
        .filter(id => id !== this.currentUserId)
    )];

    this.apiService.sendMessage({
      recipientIds: participantIds,
      parentMessageId: this.messages[this.messages.length - 1].id,
      subject: firstMsg.subject?.startsWith('Re: ') ? firstMsg.subject : 'Re: ' + firstMsg.subject,
      body: this.replyBody
    }).subscribe({
      next: () => {
        this.replyBody = '';
        this.sending = false;
        // Reload to get the new message with full sender/recipient info
        this.loadConversation();
      },
      error: () => {
        this.sending = false;
        this.alertService.error('Failed to send reply.');
      }
    });
  }

  isOwnMessage(msg: MessageModel): boolean {
    return msg.senderId === this.currentUserId;
  }
}
