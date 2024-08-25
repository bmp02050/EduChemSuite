import {Routes} from '@angular/router';
import {DistrictsComponent} from "./districts.component";
import {AddComponent} from "./add/add.component";

export const DISTRICTS_ROUTES: Routes = [
  {path: '', component: DistrictsComponent},
  {path: 'add', component: AddComponent}
];
