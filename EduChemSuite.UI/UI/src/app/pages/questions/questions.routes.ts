import {Routes} from '@angular/router';
import {QuestionsComponent} from "./questions.component";
import {AddQuestionComponent} from "./add/add.component";
import {EditQuestionComponent} from "./edit/edit.component";
import {QuestionTypesComponent} from "./types/types.component";
import {TagsComponent} from "./tags/tags.component";

export const QuestionsRoutes: Routes = [
  {path: '', component: QuestionsComponent},
  {path: 'add', component: AddQuestionComponent},
  {path: 'edit/:id', component: EditQuestionComponent},
  {path: 'types', component: QuestionTypesComponent},
  {path: 'tags', component: TagsComponent},
];
