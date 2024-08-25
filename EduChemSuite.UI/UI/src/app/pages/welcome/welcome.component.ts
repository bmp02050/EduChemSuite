import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../_services/storage.service";
import {Router} from "@angular/router";
import {UserModel} from "../../_models/UserModel";

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit{
  user: UserModel | null;

  constructor(private storageService: StorageService,
              private router: Router) {
    this.user = this.storageService.getUser();
  }

  ngOnInit() {
    console.log(this.user);
  }


}
