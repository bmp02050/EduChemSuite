import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ApiService} from "../../../_services/api.service";
import {AlertService} from "../../../_services";
import {UserModel} from "../../../_models/UserModel";
import {NzDescriptionsModule} from "ng-zorro-antd/descriptions";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzTagModule} from "ng-zorro-antd/tag";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzSwitchModule} from "ng-zorro-antd/switch";
import {AlertComponent} from "../../../_components";
import {AccountType} from "../../../_models/AccountType";
import {ThemeService} from "../../../_services/theme.service";

@Component({
    selector: 'app-profile',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NzDescriptionsModule,
        NzButtonModule,
        NzFormModule,
        NzInputModule,
        NzGridModule,
        NzTagModule,
        NzSpinModule,
        NzDividerModule,
        NzCardModule,
        NzSwitchModule,
        AlertComponent,
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: UserModel | null = null;
  loading = true;
  editing = false;
  saving = false;
  form!: FormGroup;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.loadUser();
  }

  get f() { return this.form.controls; }

  getAccountTypeLabel(): string {
    if (!this.user) return '';
    return AccountType[this.user.accountType!] || 'Unknown';
  }

  toggleEdit() {
    if (!this.editing && this.user) {
      this.form = this.formBuilder.group({
        firstName: [this.user.firstName, Validators.required],
        lastName: [this.user.lastName, Validators.required],
        address1: [this.user.address1, Validators.required],
        address2: [this.user.address2],
        address3: [this.user.address3],
        city: [this.user.city, Validators.required],
        state: [this.user.state, Validators.required],
        country: [this.user.country, Validators.required],
        zip: [this.user.zip, Validators.required],
        phone: [this.user.phone, Validators.required],
        password: [''],
        confirmPassword: [''],
        showEmail: [this.user.showEmail ?? false],
        preferDarkMode: [this.user.preferDarkMode ?? false],
      });
    }
    this.editing = !this.editing;
  }

  onSave() {
    this.alertService.clear();

    if (this.form.invalid) return;

    const pw = this.f['password'].value;
    const cpw = this.f['confirmPassword'].value;
    if (pw && pw !== cpw) {
      this.alertService.error('Passwords do not match.');
      return;
    }

    this.saving = true;
    const updated: UserModel = {
      ...this.user!,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      address1: this.f['address1'].value,
      address2: this.f['address2'].value,
      address3: this.f['address3'].value,
      city: this.f['city'].value,
      state: this.f['state'].value,
      country: this.f['country'].value,
      zip: this.f['zip'].value,
      phone: this.f['phone'].value,
      showEmail: this.f['showEmail'].value,
      preferDarkMode: this.f['preferDarkMode'].value,
    };

    if (pw) {
      updated.password = pw;
    }

    this.apiService.updateUser(this.user!.id!, updated).subscribe({
      next: (result) => {
        this.saving = false;
        this.user = result;
        this.editing = false;
        this.themeService.setDarkMode(result.preferDarkMode ?? false);
        this.alertService.success('Profile updated successfully.');
      },
      error: (err) => {
        this.saving = false;
        const message = err.error?.message || err.error || 'Update failed.';
        this.alertService.error(message);
      }
    });
  }

  private loadUser() {
    this.apiService.getMe().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alertService.error('Failed to load profile.');
      }
    });
  }
}
