import {
  Component,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { ViewChat } from '../view-chat/view-chat';
import { ViewChatBubble } from '../view-chat/view-chat-bubble';
import { ViewChatInput } from '../view-chat/view-chat-input';

interface ChatMessage {
  id: number;
  content: string;
  timestamp: Date;
  outgoing: boolean;
}

@Component({
  selector: 'page-chat',
  imports: [ViewChat, ViewChatBubble, ViewChatInput],
  template: `
    <view-chat chatName="Chat" #chat>
      @for (message of messages(); track message.id) {
        <view-chat-bubble
          [content]="message.content"
          [time]="formatTime(message.timestamp)"
          [outgoing]="message.outgoing"
        />
      }
      <view-chat-input
        view-chat-input
        [(draft)]="draft"
        (send)="send()"
      />
    </view-chat>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }
    `,
  ],
})
export class PageChatComponent {
  private readonly chat = viewChild(ViewChat);

  protected readonly messages = signal<ChatMessage[]>([
    {
      id: 1,
      content: 'Hey! Are we still on for today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 42),
      outgoing: false,
    },
    {
      id: 2,
      content: 'Yes, see you in a bit.',
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      outgoing: true,
    },
    {
      id: 3,
      content: 'Great, bringing the snacks 🍿',
      timestamp: new Date(Date.now() - 1000 * 60 * 38),
      outgoing: false,
    },
  ]);

  protected readonly draft = signal('');

  constructor() {
    effect(() => {
      this.messages();
      queueMicrotask(() => this.chat()?.scrollToBottom());
    });
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    const nextId = (this.messages().at(-1)?.id ?? 0) + 1;
    this.messages.update((list) => [
      ...list,
      { id: nextId, content: text, timestamp: new Date(), outgoing: true },
    ]);
    this.draft.set('');
  }

  protected formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
