import { Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'view-chat-input',
  imports: [FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="input-bar">
      <input
        class="message-input"
        type="text"
        placeholder="Type a message"
        [ngModel]="draft()"
        (ngModelChange)="draft.set($event)"
        (keyup.enter)="send.emit()"
      />
      <button
        mat-mini-fab
        color="primary"
        class="send-button"
        aria-label="Send message"
        [disabled]="!draft().trim()"
        (click)="send.emit()"
      >
        <mat-icon>send</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .input-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        background-color: #f0f2f5;
      }

      .message-input {
        flex: 1 1 auto;
        border: none;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        background-color: #ffffff;
      }

      .send-button {
        flex: 0 0 auto;
      }
    `,
  ],
})
export class ViewChatInput {
  readonly draft = model<string>('');
  readonly send = output<void>();
}
