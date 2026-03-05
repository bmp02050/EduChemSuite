import {Routes} from '@angular/router';
import {StudentExamsComponent} from "./student-exams.component";
import {TakeExamComponent} from "./take/take.component";
import {ExamResultComponent} from "./result/result.component";

export const StudentExamsRoutes: Routes = [
  {path: '', component: StudentExamsComponent},
  {path: 'take/:id', component: TakeExamComponent},
  {path: 'result/:id', component: ExamResultComponent},
];
