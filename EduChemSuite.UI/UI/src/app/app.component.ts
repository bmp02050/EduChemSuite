import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {StorageService} from "./_services/storage.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isCollapsed = false;
  title = "EduChem Suite";

  constructor(
    private storageService: StorageService,
    private router: Router,
  ) {
    const user = this.storageService.getUser();
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (user && Object.keys(user).length !== 0) {
      this.router.navigate(['/']).then(r => r);
    }
  }

  ngOnInit(): void {
  }
}
