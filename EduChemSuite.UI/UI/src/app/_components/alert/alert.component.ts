import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {AlertService} from "../../_services";
import {JsonPipe, NgClass, NgIf} from "@angular/common";


@Component({
  selector: 'alert', templateUrl: 'alert.component.html', standalone: true,
  imports: [
    NgClass,
    NgIf,
    JsonPipe
  ]
})
export class AlertComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  alert: any;

  constructor(private alertService: AlertService) {
  }

  ngOnInit() {
    this.subscription = this.alertService.onAlert()
      .subscribe(alert => {
        switch (alert?.type) {
          case 'success':
            alert.cssClass = 'alert alert-success';
            break;
          case 'error':
            alert.cssClass = 'alert alert-danger';
            break;
        }

        this.alert = alert;
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
