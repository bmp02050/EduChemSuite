import {Component} from '@angular/core';
import {StorageService} from "../../../_services/storage.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  standalone: true,
  styleUrl: './logout.component.css'
})
export class LogoutComponent {

  constructor(private storageService: StorageService,
              private route: ActivatedRoute,
              private router: Router,) {
  }
  ngOnInit() {
    this.storageService.logout();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigateByUrl(returnUrl).then(r => r);
  }

}
