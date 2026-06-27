import { Injectable, NgZone, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HubConnectionBuilder, type HubConnection } from '@microsoft/signalr';
import { UserService } from './user';

export interface ChatMessageDto {
  id: string;
  roomId: number;
  username: string;
  content: string;
  timestamp: string;
}

export interface SendMessageDto {
  username: string;
  content: string;
}

export type RoomListener = (count: number) => void;

/**
 * SignalR hub + REST API for chat. Connects for the current user on
 * construction and reconnects whenever the user changes.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly ngZone = inject(NgZone);
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  private readonly baseUrl = '/api/rooms';

  private connection?: HubConnection;

  private readonly _counts = new Map<string, number>();
  // CONSTRAINT once a set has been added even if empty its not deleted
  private readonly _listeners = new Map<string, Set<RoomListener>>();

  constructor() {
    effect((onCleanup) => {
      const userId = this.userService.user();
      this.disconnect();

      this.ngZone.runOutsideAngular(() => {
        this.connection = new HubConnectionBuilder()
          .withUrl(`/api/chathub?userId=${encodeURIComponent(userId)}`)
          .withAutomaticReconnect()
          .build();

        this.connection.on('MessageCounts', (counts: Record<string, number>) => {
          for (const [room, count] of Object.entries(counts)) {
            const prev = this._counts.get(room);
            this._counts.set(room, count);
            if (prev !== count) {
              this.emit(room, count);
            }
          }
        });

        this.connection.start().catch((err) => console.error('SignalR connection failed', err));
      });

      onCleanup(() => this.disconnect());
    });
  }

  /** Subscribes to count updates for a single room. Returns an unsubscribe function. */
  onCounts(room: string, listener: RoomListener): () => void {
    if (!this._listeners.has(room)) this._listeners.set(room, new Set());
    let set = this._listeners.get(room)!;
    set.add(listener);

    listener(this._counts.get(room) ?? 0);
    return () => set.delete(listener);
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop().catch(() => {});
      this.connection = undefined;
    }
  }

  getMessages(room: string): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.baseUrl}/${room}/messages`);
  }

  sendMessage(room: string, body: SendMessageDto): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(`${this.baseUrl}/${room}/messages`, body);
  }

  markAsRead(room: string, username: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${room}/read`, { username });
  }

  private emit(room: string, count: number): void {
    const set = this._listeners.get(room);
    if (set) {
      for (const listener of set) {
        listener(count);
      }
    }
  }
}
