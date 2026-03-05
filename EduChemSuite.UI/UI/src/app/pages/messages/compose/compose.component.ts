import {Component, OnDestroy, OnInit} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ApiService} from '../../../_services/api.service';
import {AlertService} from '../../../_services/alert.service';
import {UserSummaryModel} from '../../../_models/UserSummaryModel';

@Component({
    selector: 'app-compose',
    imports: [FormsModule, RouterLink, NzCardModule, NzFormModule, NzInputModule, NzSelectModule, NzButtonModule, NzIconModule],
    templateUrl: './compose.component.html',
    styleUrls: ['./compose.component.css']
})
export class ComposeComponent implements OnInit, OnDestroy {
  users: UserSummaryModel[] = [];
  selectedRecipientIds: string[] = [];
  subject = '';
  body = '';
  parentMessageId?: string;
  sending = false;
  private destroy$ = new Subject<void>();

  get userOptions() {
    return this.users.map(u => ({label: u.firstName + ' ' + u.lastName, value: u.id}));
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.apiService.getMessageableUsers().pipe(takeUntil(this.destroy$)).subscribe({
      next: users => this.users = users,
      error: (err) => {
        const msg = err?.error?.message || 'Failed to load recipients.';
        this.alertService.error(msg);
      }
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['replyTo']) {
        this.parentMessageId = params['replyTo'];
      }
      if (params['recipientId']) {
        this.selectedRecipientIds = [params['recipientId']];
      }
      if (params['subject']) {
        this.subject = params['subject'];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  send(): void {
    if (this.selectedRecipientIds.length === 0 || !this.subject.trim() || !this.body.trim()) {
      this.alertService.error('Please fill in all required fields.');
      return;
    }

    this.sending = true;
    this.apiService.sendMessage({
      recipientIds: this.selectedRecipientIds,
      parentMessageId: this.parentMessageId,
      subject: this.subject,
      body: this.body
    }).subscribe({
      next: () => {
        this.alertService.success('Message sent successfully.', true);
        this.router.navigate(['/messages']);
      },
      error: (err) => {
        this.sending = false;
        const msg = err?.error?.message || 'Failed to send message.';
        this.alertService.error(msg);
      }
    });
  }
}
