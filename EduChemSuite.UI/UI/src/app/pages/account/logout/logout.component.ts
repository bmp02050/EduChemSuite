import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../../_services/storage.service";
import {Router} from "@angular/router";
import {NzResultModule} from "ng-zorro-antd/result";
import {NzButtonModule} from "ng-zorro-antd/button";
import {EventBusService} from "../../../_helpers/event-bus.service";
import {EventData} from "../../../_helpers/event.class";

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    imports: [NzResultModule, NzButtonModule],
    styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit {

  constructor(
    private storageService: StorageService,
    private router: Router,
    private eventBusService: EventBusService,
  ) {
  }

  ngOnInit() {
    this.storageService.logout();
    this.eventBusService.emit(new EventData('logout', null));
  }

  goToLogin() {
    this.router.navigate(['/account/login']);
  }
}
