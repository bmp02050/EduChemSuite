import {Routes} from '@angular/router';
import {SchoolsComponent} from "./schools.component";
import {AddSchoolComponent} from "./add/add.component";
import {EditSchoolComponent} from "./edit/edit.component";

export const SCHOOLS_ROUTES: Routes = [
  {path: '', component: SchoolsComponent},
  {path: 'add', component: AddSchoolComponent},
  {path: 'edit/:id', component: EditSchoolComponent},
];
