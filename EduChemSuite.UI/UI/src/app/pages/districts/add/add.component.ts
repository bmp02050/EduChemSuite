import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {StorageService} from "../../../_services/storage.service";
import {AlertService, ApiService} from "../../../_services";
import {first} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css'
})
export class AddComponent implements OnInit {
  upsertDistrictForm!: FormGroup;
  userId!: string;
  constructor(private fb: FormBuilder,
              private storageService: StorageService,
              private apiService: ApiService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userId = user ? user.id : '';

    this.upsertDistrictForm = this.fb.group({
      districtName: ['', Validators.required],
      userId: [this.userId, Validators.required],
      id: [], // Optional field
      createdAt: [], // Optional field
      updatedAt: [], // Optional field
      isActive: [true] // Default value
    });
  }

  onSubmit(): void {
    if (this.upsertDistrictForm.valid) {
      const formData = this.upsertDistrictForm.value;
      console.log('Form Data:', formData);

      this.apiService.upsertDistrict(formData)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('New District created', true);
            window.location.reload();
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
  }
}
