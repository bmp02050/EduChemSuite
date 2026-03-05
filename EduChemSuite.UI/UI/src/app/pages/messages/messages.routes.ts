import {Routes} from '@angular/router';

export const MessagesRoutes: Routes = [
  {path: '', loadComponent: () => import('./inbox/inbox.component').then(m => m.InboxComponent)},
  {path: 'sent', loadComponent: () => import('./sent/sent.component').then(m => m.SentComponent)},
  {path: 'compose', loadComponent: () => import('./compose/compose.component').then(m => m.ComposeComponent)},
  {path: 'conversation/:id', loadComponent: () => import('./conversation/conversation.component').then(m => m.ConversationComponent)},
];
