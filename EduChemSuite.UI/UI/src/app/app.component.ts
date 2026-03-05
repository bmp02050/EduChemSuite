import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {BreakpointObserver} from '@angular/cdk/layout';
import {StorageService} from "./_services/storage.service";
import {SessionService} from "./_services/session.service";
import {SignalRService} from "./_services/signalr.service";
import {ApiService} from "./_services/api.service";
import {EventBusService} from "./_helpers/event-bus.service";
import {EventData} from "./_helpers/event.class";
import {Subscription} from "rxjs";
import {filter} from "rxjs/operators";
import {AccountType} from "./_models/AccountType";
import {ThemeService} from "./_services/theme.service";


@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, NzBadgeModule, NzDrawerModule, NzAvatarModule, NzDropDownModule, NzButtonModule, RouterLink, RouterLinkActive],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isCollapsed = false;
  isMobile = false;
  drawerVisible = false;
  title = "EduChem Suite";
  currentUser: any = null;
  unreadCount = 0;

  private eventBusSub?: Subscription;
  private routerSub?: Subscription;
  private unreadSub?: Subscription;

  constructor(
    private storageService: StorageService,
    private sessionService: SessionService,
    private signalRService: SignalRService,
    private apiService: ApiService,
    private router: Router,
    private eventBusService: EventBusService,
    private breakpointObserver: BreakpointObserver,
    public themeService: ThemeService,
  ) {
  }

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.refreshLoginState();

    if (this.storageService.isLoggedIn()) {
      this.sessionService.startSession();
      this.connectMessaging();
      // Sync dark mode from stored user preference
      const user = this.storageService.getUser();
      if (user?.preferDarkMode !== undefined) {
        this.themeService.setDarkMode(user.preferDarkMode);
      }
    }

    this.eventBusSub = this.eventBusService.on('logout', () => {
      this.sessionService.endSession();
      this.signalRService.disconnect();
      this.storageService.logout();
      this.isLoggedIn = false;
      this.currentUser = null;
      this.unreadCount = 0;
    });

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.refreshLoginState();
      });

    // Observe mobile breakpoint
    this.breakpointObserver.observe('(max-width: 768px)').subscribe(result => {
      this.isMobile = result.matches;
      if (this.isMobile) {
        this.isCollapsed = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sessionService.endSession();
    this.signalRService.disconnect();
    this.eventBusSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.drawerVisible = !this.drawerVisible;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  onMenuClick(): void {
    if (this.isMobile) {
      this.drawerVisible = false;
    }
  }

  isElevatedUser(): boolean {
    if (!this.currentUser) return false;
    const type = this.currentUser.accountType;
    return type === AccountType.Admin || type === AccountType.AdminStaff;
  }

  isStaffOrAbove(): boolean {
    if (!this.currentUser) return false;
    const type = this.currentUser.accountType;
    return type === AccountType.Admin || type === AccountType.AdminStaff || type === AccountType.Staff;
  }

  isStudent(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.accountType === AccountType.Student;
  }

  canInvite(): boolean {
    return this.isLoggedIn && this.isStaffOrAbove();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode;
  }

  get avatarLabel(): string {
    if (!this.currentUser) return '';
    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return (firstInitial + lastInitial).substring(0, 2) || '?';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  private refreshLoginState(): void {
    const wasLoggedIn = this.isLoggedIn;
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.currentUser = this.isLoggedIn ? this.storageService.getUser() : null;

    if (this.isLoggedIn && !wasLoggedIn) {
      this.connectMessaging();
    }
  }

  private connectMessaging(): void {
    this.signalRService.connect();

    this.apiService.getUnreadCount().subscribe({
      next: count => this.unreadCount = count
    });

    this.unreadSub = this.signalRService.unreadCountUpdated$.subscribe(count => {
      this.unreadCount = count;
    });
  }
}
