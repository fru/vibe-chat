import { Component, input } from '@angular/core';

@Component({
  selector: 'view-chat-bubble',
  template: `
    <div
      class="message-row"
      [class.outgoing]="outgoing()"
      [class.incoming]="!outgoing()"
    >
      <div class="bubble">
        <span class="bubble-text">{{ content() }}</span>
        <span class="bubble-time">{{ time() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .message-row {
        display: flex;
        width: 100%;

        .bubble {
          max-width: 75%;
          padding: 6px 10px 4px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          word-break: break-word;
        }
      }

      .message-row.incoming {
        justify-content: flex-start;

        .bubble {
          background-color: #ffffff;
          border-bottom-left-radius: 2px;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
        }
      }

      .message-row.outgoing {
        justify-content: flex-end;

        .bubble {
          background-color: #d9fdd3;
          border-bottom-right-radius: 2px;
          box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
        }
      }

      .bubble-text {
        font-size: 14px;
        line-height: 1.3;
      }

      .bubble-time {
        font-size: 10px;
        color: rgba(0, 0, 0, 0.45);
        align-self: flex-end;
        margin-top: 2px;
      }
    `,
  ],
})
export class ViewChatBubble {
  readonly content = input.required<string>();
  readonly time = input.required<string>();
  readonly outgoing = input<boolean>(false);
}
