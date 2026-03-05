import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {StorageService} from "../../../_services/storage.service";
import {AlertService, ApiService} from "../../../_services";
import {first} from "rxjs";
import {Router, RouterLink} from "@angular/router";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzCardModule} from "ng-zorro-antd/card";
import {AlertComponent} from "../../../_components";

@Component({
    selector: 'app-add',
    imports: [
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule,
        RouterLink,
        AlertComponent,
    ],
    templateUrl: './add.component.html',
    styleUrl: './add.component.css'
})
export class AddComponent implements OnInit {
  upsertDistrictForm!: FormGroup;
  userId!: string;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userId = user ? user.id : '';

    this.upsertDistrictForm = this.fb.group({
      districtName: ['', Validators.required],
      userId: [this.userId, Validators.required],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.upsertDistrictForm.valid) {
      this.loading = true;
      this.apiService.upsertDistrict(this.upsertDistrictForm.value)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('District created successfully', true);
            this.router.navigate(['/districts']);
          },
          error: (err) => {
            this.loading = false;
            const message = err.error?.message || err.error || 'Failed to create district.';
            this.alertService.error(message);
          }
        });
    }
  }
}
