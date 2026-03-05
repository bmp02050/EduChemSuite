import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private subject = new Subject<any>();
  private showAfterRedirect = false;

  constructor(
    private router: Router,
    private message: NzMessageService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.showAfterRedirect) {
          this.showAfterRedirect = false;
        } else {
          this.clear();
        }
      }
    });
  }

  onAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  success(message: string, showAfterRedirect = false) {
    this.showAfterRedirect = showAfterRedirect;
    this.message.success(message, { nzDuration: 5000 });
    this.subject.next({ type: 'success', message });
  }

  error(message: string, showAfterRedirect = false) {
    this.showAfterRedirect = showAfterRedirect;
    this.message.error(message, { nzDuration: 5000 });
    this.subject.next({ type: 'error', message });
  }

  clear() {
    this.subject.next(null);
  }
}
