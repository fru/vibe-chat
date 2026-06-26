import { Routes } from '@angular/router';
import { PageChatComponent } from './pages/page-chat';
import { PageRoomsComponent } from './pages/page-rooms';
import { PageWorkflowComponent } from './pages/page-workflow';

export const routes: Routes = [
  {
    path: 'messages',
    component: PageChatComponent,
    title: 'Nachrichten',
  },
  {
    path: 'filter/rooms',
    component: PageRoomsComponent,
    title: 'Zimmer',
  },
  {
    path: 'filter/workflow',
    component: PageWorkflowComponent,
    title: 'Arbeitsablauf',
  },
  { path: '**', redirectTo: 'messages' },
];
