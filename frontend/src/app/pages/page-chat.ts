import {
  Component,
  OnDestroy,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChat } from '../view-chat/view-chat';
import { ViewChatBubble } from '../view-chat/view-chat-bubble';
import { ViewChatInput } from '../view-chat/view-chat-input';
import {
  ChatApiService,
  type ChatMessageDto,
} from '../services/chat-api';
import { ChatHubService } from '../services/chat-hub';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  outgoing: boolean;
  pending: boolean;
}

@Component({
  selector: 'page-chat',
  imports: [ViewChat, ViewChatBubble, ViewChatInput],
  template: `
    <view-chat [chatName]="room()" #chat>
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
export class PageChatComponent implements OnDestroy {
  private readonly chat = viewChild(ViewChat);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ChatApiService);
  private readonly hub = inject(ChatHubService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly room = signal('common');
  protected readonly user = signal('A');

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly draft = signal('');

  /** Last unread count seen for the current room, used to detect changes. */
  private lastCount = -1;
  private unsubscribeHub?: () => void;

  constructor() {
    // Ensure default query params (room, user) are present in the URL.
    const snapshot = this.route.snapshot.queryParams;
    const room = snapshot['room'] ?? 'common';
    const user = snapshot['user'] ?? 'A';
    const queryParams: Record<string, string> = { ...snapshot };
    let needsUpdate = false;
    if (!snapshot['room']) {
      queryParams['room'] = 'common';
      needsUpdate = true;
    }
    if (!snapshot['user']) {
      queryParams['user'] = 'A';
      needsUpdate = true;
    }
    this.room.set(room);
    this.user.set(user);
    if (needsUpdate) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    // React to room/user changes from the URL.
    this.route.queryParams.subscribe((params) => {
      const newRoom = params['room'] ?? 'common';
      const newUser = params['user'] ?? 'A';
      const changed =
        newRoom !== this.room() || newUser !== this.user();
      this.room.set(newRoom);
      this.user.set(newUser);
      if (changed) {
        this.lastCount = -1;
        this.ensureHubConnected();
        this.loadMessages();
      }
    });

    // Subscribe to unread-count updates from the hub. When the count for the
    // currently-viewed room changes, re-fetch the messages.
    this.unsubscribeHub = this.hub.onCounts((counts) => {
      const currentRoom = this.room();
      const next = counts[currentRoom] ?? 0;
      if (next !== this.lastCount) {
        this.lastCount = next;
        this.loadMessages();
      }
    });

    this.ensureHubConnected();

    // Initial load.
    this.loadMessages();

    effect(() => {
      this.messages();
      queueMicrotask(() => this.chat()?.scrollToBottom());
    });
  }

  private ensureHubConnected(): void {
    this.hub.connect(this.user());
  }

  private loadMessages(): void {
    const room = this.room();
    const currentUser = this.user();
    this.api.getMessages(room).subscribe({
      next: (dtos) => {
        this.messages.set(
          dtos.map((dto) => this.toChatMessage(dto, currentUser)),
        );
        // Mark the room as read now that the user has the latest messages.
        this.api.markAsRead(room, currentUser).subscribe();
      },
      error: () => {
        this.snackBar.open(
          'Failed to load messages',
          'Dismiss',
          { duration: 4000 },
        );
      },
    });
  }

  protected send(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }

    const id = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      id,
      content: text,
      timestamp: new Date(),
      outgoing: true,
      pending: true,
    };

    this.messages.update((list) => [...list, optimisticMessage]);
    this.draft.set('');

    const room = this.room();
    const user = this.user();

    this.api.sendMessage(room, { username: user, content: text }).subscribe({
      next: (dto) => {
        this.messages.update((list) =>
          list.map((m) =>
            m.id === id
              ? this.toChatMessage(dto, user)
              : m,
          ),
        );
      },
      error: () => {
        // Remove the optimistic message and restore the content to the input.
        this.messages.update((list) => list.filter((m) => m.id !== id));
        this.draft.set(text);
        this.snackBar.open(
          'Message failed to send',
          'Dismiss',
          { duration: 4000 },
        );
      },
    });
  }

  private toChatMessage(dto: ChatMessageDto, currentUser: string): ChatMessage {
    return {
      id: dto.id,
      content: dto.content,
      timestamp: new Date(dto.timestamp),
      outgoing: dto.username === currentUser,
      pending: false,
    };
  }

  protected formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy(): void {
    this.unsubscribeHub?.();
  }
}
