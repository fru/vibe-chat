/**
 * Shared types mirroring the backend DTOs in
 * `backend/Controllers/ChatControllers.cs`.
 *
 * Keeping these in one place ensures the REST client and the SignalR service
 * agree on the wire format.
 */
export interface ChatMessageDto {
  id: string;
  roomId: number;
  username: string;
  content: string;
  timestamp: string;
}

export interface SendMessageDto {
  id: string;
  username: string;
  content: string;
}

/** `Record<roomName, unreadCount>` pushed by the hub `MessageCounts` event. */
export type RoomCounts = Record<string, number>;

export type RoomCountListener = (count: number) => void;
