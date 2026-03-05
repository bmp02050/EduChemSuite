import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { EventBusService } from '../_helpers/event-bus.service';
import { EventData } from '../_helpers/event.class';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 60 minutes
const ACTIVITY_THROTTLE_MS = 30 * 1000;      // 30 seconds
const REFRESH_BUFFER_MS = 5 * 60 * 1000;     // 5 minutes before expiry
const INACTIVITY_CHECK_MS = 60 * 1000;        // check every 60 seconds

@Injectable({ providedIn: 'root' })
export class SessionService {
  private lastActivityTime = Date.now();
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private inactivityTimer: ReturnType<typeof setInterval> | null = null;
  private activityThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionActive = false;

  private boundTrackActivity = this.onActivity.bind(this);

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private eventBusService: EventBusService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  startSession(): void {
    if (this.sessionActive) return;
    this.sessionActive = true;
    this.lastActivityTime = Date.now();

    document.addEventListener('mousemove', this.boundTrackActivity);
    document.addEventListener('click', this.boundTrackActivity);
    document.addEventListener('keydown', this.boundTrackActivity);

    this.scheduleProactiveRefresh();
    this.startInactivityCheck();
  }

  endSession(): void {
    if (!this.sessionActive) return;
    this.sessionActive = false;

    document.removeEventListener('mousemove', this.boundTrackActivity);
    document.removeEventListener('click', this.boundTrackActivity);
    document.removeEventListener('keydown', this.boundTrackActivity);

    this.clearTimers();
  }

  private onActivity(): void {
    if (!this.sessionActive) return;

    // Throttle: only update once per ACTIVITY_THROTTLE_MS
    if (this.activityThrottleTimer) return;

    this.lastActivityTime = Date.now();
    this.activityThrottleTimer = setTimeout(() => {
      this.activityThrottleTimer = null;
    }, ACTIVITY_THROTTLE_MS);
  }

  private scheduleProactiveRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    const user = this.storageService.getUser();
    if (!user?.accessToken) return;

    const expMs = this.getTokenExpiry(user.accessToken);
    if (!expMs) return;

    const refreshAt = expMs - REFRESH_BUFFER_MS;
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
      // Token already within buffer or expired — refresh now
      this.doProactiveRefresh();
      return;
    }

    // Run outside Angular zone so the timer doesn't trigger change detection
    this.ngZone.runOutsideAngular(() => {
      this.refreshTimer = setTimeout(() => {
        this.ngZone.run(() => this.doProactiveRefresh());
      }, delay);
    });
  }

  private doProactiveRefresh(): void {
    if (!this.sessionActive) return;

    // Only refresh if user is still active
    const idleMs = Date.now() - this.lastActivityTime;
    if (idleMs >= INACTIVITY_LIMIT_MS) return;

    const user = this.storageService.getUser();
    if (!user?.refreshToken) return;

    this.authService.refreshToken(user.id, user.refreshToken).subscribe({
      next: (response) => {
        this.storageService.saveUser(response);
        this.scheduleProactiveRefresh();
      },
      error: () => {
        this.handleSessionExpired();
      }
    });
  }

  private startInactivityCheck(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
    }

    this.ngZone.runOutsideAngular(() => {
      this.inactivityTimer = setInterval(() => {
        const idleMs = Date.now() - this.lastActivityTime;
        if (idleMs >= INACTIVITY_LIMIT_MS) {
          this.ngZone.run(() => this.handleSessionExpired());
        }
      }, INACTIVITY_CHECK_MS);
    });
  }

  private handleSessionExpired(): void {
    const currentUrl = this.router.url;
    this.endSession();
    this.eventBusService.emit(new EventData('logout', null));
    this.router.navigate(['/account/login'], {
      queryParams: { returnUrl: currentUrl, expired: 'true' }
    });
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.exp ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private clearTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.activityThrottleTimer) {
      clearTimeout(this.activityThrottleTimer);
      this.activityThrottleTimer = null;
    }
  }
}
