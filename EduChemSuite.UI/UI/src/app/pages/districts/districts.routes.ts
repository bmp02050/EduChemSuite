import {Routes} from '@angular/router';
import {DistrictsComponent} from "./districts.component";
import {AddComponent} from "./add/add.component";
import {EditDistrictComponent} from "./edit/edit.component";

export const DISTRICTS_ROUTES: Routes = [
  {path: '', component: DistrictsComponent},
  {path: 'add', component: AddComponent},
  {path: 'edit/:id', component: EditDistrictComponent},
];
