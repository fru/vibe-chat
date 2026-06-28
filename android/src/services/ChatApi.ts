import { config } from '@/config/env';
import { authService } from '@/services/AuthService';
import type { ChatMessageDto, SendMessageDto } from '@/types/chat';

/**
 * Thin REST client for the chat API.
 *
 * Mirrors `frontend/src/app/services/chat.ts` so the web and mobile clients
 * hit identical endpoints:
 *   GET  /api/rooms/{room}/messages
 *   POST /api/rooms/{room}/messages
 *   POST /api/rooms/{room}/read
 *
 * Every request carries the native auth token (Authorization: Bearer) so the
 * backend can identify the caller — the same credential handed to the WebView.
 */
export class ChatApi {
  private readonly baseUrl = `${config.apiUrl}/api/rooms`;

  private authHeaders(): Record<string, string> {
    const token = authService.current?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getMessages(room: string): Promise<ChatMessageDto[]> {
    const res = await fetch(`${this.baseUrl}/${room}/messages`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...this.authHeaders() },
    });
    if (!res.ok) throw new Error(`getMessages failed: ${res.status}`);
    return (await res.json()) as ChatMessageDto[];
  }

  async sendMessage(
    room: string,
    body: SendMessageDto,
  ): Promise<ChatMessageDto> {
    const res = await fetch(`${this.baseUrl}/${room}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.authHeaders(),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`sendMessage failed: ${res.status}`);
    return (await res.json()) as ChatMessageDto;
  }

  async markAsRead(room: string, username: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${room}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error(`markAsRead failed: ${res.status}`);
  }
}

export const chatApi = new ChatApi();
