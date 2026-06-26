import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-messages',
  imports: [MatCardModule],
  template: `
    <mat-card class="page-card">
      <mat-card-title>Messages</mat-card-title>
      <mat-card-content>
        <p>You have {{ count }} open messages.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .page-card {
        margin: 24px;
        max-width: 480px;
      }
    `,
  ],
})
export class MessagesComponent {
  protected readonly count = 3;
}
