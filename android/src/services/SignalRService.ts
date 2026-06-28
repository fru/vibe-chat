import { AppState, type AppStateStatus } from 'react-native';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { config } from '@/config/env';
import { authService } from '@/services/AuthService';
import type { RoomCounts, RoomCountListener } from '@/types/chat';

/**
 * SignalR hub connection with React Native `AppState` lifecycle management.
 *
 * Implements the foreground/background strategy from
 * `plans/5-android-app.md` §3:
 *  - `active`: establish/restore the hub connection.
 *  - `background`: gracefully stop the connection to prevent ghost sockets.
 *
 * The hub only pushes `MessageCounts` events (`Record<roomName, count>`),
 * mirroring `backend/Services/ChatService.NotifyUserCountsAsync`.
 */
class SignalRService {
  private connection: HubConnection | null = null;
  private userId: string | null = null;

  // INVARIANT: once a room key is added it is never deleted, matching the
  // Angular frontend constraint in `frontend/src/app/services/chat.ts`.
  private readonly counts = new Map<string, number>();
  private readonly listeners = new Map<string, Set<RoomCountListener>>();

  private appStateSubscription: { remove: () => void } | null = null;

  /** Begin listening for the given user. Reconnects if the user changes. */
  connect(userId: string): void {
    this.userId = userId;
    this.ensureAppStateSubscription();
    void this.startConnection();
  }

  /** Fully tear down the connection and listeners. */
  disconnect(): void {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
    void this.stopConnection();
    this.userId = null;
  }

  /** Subscribe to count updates for a single room. Returns an unsubscribe fn. */
  onCounts(room: string, listener: RoomCountListener): () => void {
    if (!this.listeners.has(room)) {
      this.listeners.set(room, new Set());
    }
    const set = this.listeners.get(room)!;
    set.add(listener);

    // Emit the last known value immediately, like the Angular service.
    listener(this.counts.get(room) ?? 0);

    return () => {
      set.delete(listener);
    };
  }

  /** Current cached count for a room (0 if unknown). */
  getCount(room: string): number {
    return this.counts.get(room) ?? 0;
  }

  // --- internals -----------------------------------------------------------

  private ensureAppStateSubscription(): void {
    if (this.appStateSubscription) return;
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => this.handleAppStateChange(nextState),
    );
  }

  private handleAppStateChange(state: AppStateStatus): void {
    if (state === 'active') {
      void this.startConnection();
    } else if (state === 'background' || state === 'inactive') {
      // Gracefully close to prevent ghost sockets; the backend will fall back
      // to WonderPush for any messages that arrive while we are gone.
      void this.stopConnection();
    }
  }

  private async startConnection(): Promise<void> {
    if (!this.userId) return;
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected
    ) {
      return;
    }

    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(`${config.hubUrl}?userId=${encodeURIComponent(this.userId)}`, {
          // Hand the native auth token to the hub so the backend can identify
          // the caller — same credential handed to the WebView.
          accessTokenFactory: () => authService.current?.token ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

      this.connection.on('MessageCounts', (counts: RoomCounts) => {
        for (const [room, count] of Object.entries(counts)) {
          const prev = this.counts.get(room);
          this.counts.set(room, count);
          if (prev !== count) {
            this.emit(room, count);
          }
        }
      });

      await this.connection.start();
    } catch (err) {
      console.warn('SignalR connection failed', err);
    }
  }

  private async stopConnection(): Promise<void> {
    if (!this.connection) return;
    try {
      await this.connection.stop();
    } catch {
      // ignore — we are tearing down anyway
    } finally {
      this.connection = null;
    }
  }

  private emit(room: string, count: number): void {
    const set = this.listeners.get(room);
    if (set) {
      for (const listener of set) {
        listener(count);
      }
    }
  }
}

export const signalR = new SignalRService();
