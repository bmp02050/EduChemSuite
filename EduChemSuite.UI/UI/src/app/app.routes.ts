import { Routes } from '@angular/router';
import { AuthGuard } from './_helpers/auth.guard';
import { roleGuard } from './_helpers/role.guard';
import { AccountType } from './_models/AccountType';

const staffRoles = [AccountType.Admin, AccountType.AdminStaff, AccountType.Staff];
const elevatedRoles = [AccountType.Admin, AccountType.AdminStaff];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES), canActivate: [AuthGuard] },
  { path: 'districts', loadChildren: () => import('./pages/districts/districts.routes').then(m => m.DISTRICTS_ROUTES), canActivate: [AuthGuard, roleGuard], data: { roles: elevatedRoles } },
  { path: 'schools', loadChildren: () => import('./pages/schools/schools.routes').then(m => m.SCHOOLS_ROUTES), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'exams', loadChildren: () => import('./pages/exams/exams.routes').then(m => m.ExamsRoutes), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'student-exams', loadChildren: () => import('./pages/student-exams/student-exams.routes').then(m => m.StudentExamsRoutes), canActivate: [AuthGuard] },
  { path: 'grades', loadChildren: () => import('./pages/grades/grades.routes').then(m => m.GradesRoutes), canActivate: [AuthGuard] },
  { path: 'questions', loadChildren: () => import('./pages/questions/questions.routes').then(m => m.QuestionsRoutes), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'answers', loadChildren: () => import('./pages/answers/answers.routes').then(m => m.AnswersRoutes), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'molecule-editor', loadComponent: () => import('./pages/molecule-editor/molecule-editor.component').then(m => m.MoleculeEditorComponent), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'users', loadChildren: () => import('./pages/users/users.routes').then(m => m.UsersRoutes), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'messages', loadChildren: () => import('./pages/messages/messages.routes').then(m => m.MessagesRoutes), canActivate: [AuthGuard] },
  { path: 'data-management', loadChildren: () => import('./pages/data-management/data-management.routes').then(m => m.DataManagementRoutes), canActivate: [AuthGuard, roleGuard], data: { roles: staffRoles } },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'knowledge-base', loadComponent: () => import('./pages/knowledge-base/knowledge-base.component').then(m => m.KnowledgeBaseComponent) },
  { path: 'account', loadChildren: () => import('./pages/account/account.routes').then(m => m.AccountRoutes) },
];
