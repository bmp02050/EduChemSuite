import {Component, OnInit} from '@angular/core';

import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {ApiService} from '../../../_services/api.service';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzResultModule} from 'ng-zorro-antd/result';
import {AlertComponent} from '../../../_components';
import {AlertService} from '../../../_services';

@Component({
    selector: 'app-reset-password',
    imports: [
    ReactiveFormsModule,
    RouterLink,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzResultModule,
    AlertComponent
],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  success = false;
  errorMessage = '';
  private userId = '';
  private token = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.queryParams['userId'] || '';
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.userId || !this.token) {
      this.errorMessage = 'Invalid reset link. Missing userId or token.';
    }

    this.form = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.alertService.clear();

    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }

    if (this.f['newPassword'].value !== this.f['confirmPassword'].value) {
      this.alertService.error('Passwords do not match.');
      return;
    }

    this.loading = true;
    this.apiService.resetPassword(this.userId, this.token, this.f['newPassword'].value).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error || 'Password reset failed. The link may have expired.';
      }
    });
  }
}
