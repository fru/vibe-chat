import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'view-chat',
  imports: [MatCardModule],
  template: `
    <mat-card class="chat-card">
      <div class="chat-header">
        <span class="chat-name">{{ chatName() }}</span>
      </div>
      <div class="messages-list">
        <ng-content />
      </div>
      <ng-content select="[view-chat-input]" />
    </mat-card>
  `,
  styles: [
    `
      .chat-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 70vh;
        padding: 0;
        overflow: hidden;
      }

      .chat-header {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        background-color: rgba(0, 0, 0, 0.02);
      }

      .chat-name {
        font-weight: 600;
        font-size: 16px;
      }

      .messages-list {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        background-color: rgba(0, 0, 0, 0.03);
      }
    `,
  ],
})
export class ViewChat {
  readonly chatName = input<string>('Chat');
}
