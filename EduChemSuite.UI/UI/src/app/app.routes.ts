import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'districts', loadChildren: () => import('./pages/districts/districts.routes').then(m => m.DISTRICTS_ROUTES)},
  { path: 'schools', loadChildren: () => import('./pages/schools/schools.routes').then(m => m.SCHOOLS_ROUTES)},
  { path: 'exams', loadChildren: () => import('./pages/exams/exams.routes').then(m => m.ExamsRoutes)},
  { path: 'grades', loadChildren: () => import('./pages/grades/grades.routes').then(m => m.GradesRoutes)},
  { path: 'questions', loadChildren: () => import('./pages/questions/questions.routes').then(m => m.QuestionsRoutes)},
  { path: 'answers', loadChildren: () => import('./pages/answers/answers.routes').then(m => m.AnswersRoutes)},
  { path: 'account', loadChildren: () => import('./pages/account/account.routes').then(m => m.AccountRoutes)},
];
