import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages';
import { OtherComponent } from './other/other';

export const routes: Routes = [
  { path: '', redirectTo: 'messages', pathMatch: 'full' },
  { path: 'messages', component: MessagesComponent, title: 'Messages' },
  {
    path: 'other/a',
    component: OtherComponent,
    data: { title: 'Menu A' },
    title: 'Menu A',
  },
  {
    path: 'other/b',
    component: OtherComponent,
    data: { title: 'Menu B' },
    title: 'Menu B',
  },
  {
    path: 'other/c',
    component: OtherComponent,
    data: { title: 'Menu C' },
    title: 'Menu C',
  },
  {
    path: 'other/d',
    component: OtherComponent,
    data: { title: 'Menu D' },
    title: 'Menu D',
  },
  { path: '**', redirectTo: 'messages' },
];
