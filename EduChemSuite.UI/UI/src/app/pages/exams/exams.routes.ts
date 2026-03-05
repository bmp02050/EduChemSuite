import {Routes} from '@angular/router';
import {ExamsComponent} from "./exams.component";
import {AddExamComponent} from "./add/add.component";
import {EditExamComponent} from "./edit/edit.component";
import {PreviewExamComponent} from "./preview/preview.component";
import {ReviewExamComponent} from "./review/review.component";

export const ExamsRoutes: Routes = [
  {path: '', component: ExamsComponent},
  {path: 'add', component: AddExamComponent},
  {path: 'edit/:id', component: EditExamComponent},
  {path: 'preview/:id', component: PreviewExamComponent},
  {path: 'review/:id', component: ReviewExamComponent},
];
