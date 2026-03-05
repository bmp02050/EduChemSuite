import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../_services/auth.service";
import {StorageService} from "../../../_services/storage.service";
import {SessionService} from "../../../_services/session.service";
import {AlertService} from "../../../_services";
import {ApiService} from "../../../_services/api.service";
import {ThemeService} from "../../../_services/theme.service";
import {first} from "rxjs";

import {AlertComponent} from "../../../_components";
import {HttpErrorResponse} from "@angular/common/http";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";

@Component({
    selector: 'app-login',
    imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  isLoggedIn = false;
  isLoginFailed = false;
  showResendVerification = false;
  resendLoading = false;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private sessionService: SessionService,
    private alertService: AlertService,
    private apiService: ApiService,
    private themeService: ThemeService
  ) {
    if (this.storageService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (this.route.snapshot.queryParams['expired']) {
      this.alertService.error('Your session has expired. Please log in again.');
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.loading = true;
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.storageService.saveUser(data);
          this.sessionService.startSession();
          if (data.preferDarkMode !== undefined) {
            this.themeService.setDarkMode(data.preferDarkMode);
          }

          this.isLoginFailed = false;
          this.isLoggedIn = true;
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error: HttpErrorResponse) => {
          const message = this.extractErrorMessage(error);
          this.alertService.error(message);
          this.loading = false;
          this.isLoginFailed = true;
        }
      });
  }

  resendVerification() {
    this.resendLoading = true;
    this.apiService.resendVerificationEmail(this.f['email'].value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Verification email sent! Please check your inbox.');
          this.showResendVerification = false;
          this.resendLoading = false;
        },
        error: () => {
          this.alertService.error('Failed to resend verification email. Please try again.');
          this.resendLoading = false;
        }
      });
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    let raw = '';
    if (typeof error.error === 'string') {
      raw = error.error;
    } else if (error.error?.message) {
      raw = error.error.message;
    } else {
      raw = error.message || 'An unexpected error occurred.';
    }

    const lower = raw.toLowerCase();
    if (lower.includes('does not exist or is not verified')) {
      this.showResendVerification = true;
      return 'Your email has not been verified. Please check your inbox for a confirmation link.';
    }
    this.showResendVerification = false;
    if (lower.includes('does not exist')) {
      return 'No account found with that email.';
    }
    if (lower.includes("don't match") || lower.includes('do not match')) {
      return 'Incorrect password.';
    }

    return raw;
  }
}
