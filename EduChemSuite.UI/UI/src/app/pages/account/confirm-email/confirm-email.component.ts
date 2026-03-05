
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../../_services/api.service";
import {NzResultModule} from "ng-zorro-antd/result";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzSpinModule} from "ng-zorro-antd/spin";

import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-confirm-email',
    imports: [NzResultModule, NzButtonModule, NzSpinModule, RouterLink],
    templateUrl: './confirm-email.component.html',
    styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {
  }

  ngOnInit() {
    const userId = this.route.snapshot.queryParams['userId'];
    const token = this.route.snapshot.queryParams['token'];

    if (!userId || !token) {
      this.loading = false;
      this.errorMessage = 'Invalid confirmation link. Missing userId or token.';
      return;
    }

    this.apiService.confirmEmail(userId, token).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error || 'Email confirmation failed. The link may have expired.';
      }
    });
  }
}
