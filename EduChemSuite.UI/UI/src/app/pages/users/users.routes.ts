import {Routes} from "@angular/router";
import {UsersComponent} from "./users.component";
import {EditUserComponent} from "./edit/edit.component";

export const UsersRoutes: Routes = [
  {path: '', component: UsersComponent},
  {path: 'edit/:id', component: EditUserComponent},
];
