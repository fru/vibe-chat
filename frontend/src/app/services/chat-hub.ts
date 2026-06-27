import { Injectable, NgZone, inject } from '@angular/core';
import {
  HubConnectionBuilder,
  HubConnectionState,
  type HubConnection,
} from '@microsoft/signalr';

/** Map of room name -> current message count. */
export type RoomMessageCounts = Record<string, number>;

/**
 * Simplest possible SignalR integration: the hub only pushes a map of
 * room-name -> message count. It never carries message payloads.
 *
 * Components that are currently viewing a chat room react to a count change
 * by re-fetching the messages via the REST API.
 */
@Injectable({ providedIn: 'root' })
export class ChatHubService {
  private readonly ngZone = inject(NgZone);

  private connection?: HubConnection;
  private currentUserId?: string;

  /** Latest known counts, updated whenever the hub pushes an update. */
  private readonly _counts = new Map<string, number>();

  /** Listeners notified on every count update. */
  private readonly listeners = new Set<(counts: RoomMessageCounts) => void>();

  /** Connects (or reconnects) the hub for the given user. */
  connect(userId: string): void {
    if (this.currentUserId === userId && this.connection) {
      return;
    }
    this.currentUserId = userId;
    this.disconnect();

    // Run the connection outside Angular so SignalR's long-lived promises
    // don't trigger unnecessary change detection.
    this.ngZone.runOutsideAngular(() => {
      this.connection = new HubConnectionBuilder()
        .withUrl(`/chathub?userId=${encodeURIComponent(userId)}`)
        .withAutomaticReconnect()
        .build();

      this.connection.on('MessageCounts', (counts: RoomMessageCounts) => {
        this._counts.clear();
        for (const [room, count] of Object.entries(counts)) {
          this._counts.set(room, count);
        }
        this.emit();
      });

      this.connection
        .start()
        .catch((err) => console.error('SignalR connection failed', err));
    });
  }

  /** Subscribes to count updates. Returns an unsubscribe function. */
  onCounts(listener: (counts: RoomMessageCounts) => void): () => void {
    this.listeners.add(listener);
    // Immediately deliver the latest snapshot.
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  /** Returns the last known count for a room, or 0. */
  countFor(room: string): number {
    return this._counts.get(room) ?? 0;
  }

  /** Asks the hub for a fresh count snapshot. */
  requestCounts(): void {
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected &&
      this.currentUserId
    ) {
      this.connection
        .invoke('RequestCounts', this.currentUserId)
        .catch((err) => console.error('RequestCounts failed', err));
    }
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop().catch(() => {});
      this.connection = undefined;
    }
  }

  private snapshot(): RoomMessageCounts {
    const result: RoomMessageCounts = {};
    for (const [room, count] of this._counts) {
      result[room] = count;
    }
    return result;
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
