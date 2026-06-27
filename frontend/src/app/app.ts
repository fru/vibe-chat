import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ViewMainMenuItem } from './components-layout/view-main-menu-item';
import { ViewMainMenuGroup } from './components-layout/view-main-menu-group';
import { ViewToolbar } from './components-layout/view-toolbar';
import { DataChatMenuItem } from './components-chat/data-chat-menu-item';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ViewMainMenuItem,
    ViewMainMenuGroup,
    ViewToolbar,
    DataChatMenuItem,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
