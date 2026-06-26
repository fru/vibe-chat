import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessageDto {
  id: string;
  roomId: number;
  username: string;
  content: string;
  timestamp: string;
  receivedAll: boolean;
}

export interface SendMessageDto {
  username: string;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/rooms';

  getMessages(room: string): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.baseUrl}/${room}/messages`);
  }

  sendMessage(
    room: string,
    body: SendMessageDto,
  ): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(
      `${this.baseUrl}/${room}/messages`,
      body,
    );
  }
}
