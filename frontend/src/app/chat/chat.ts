import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonFooter,
  IonIcon,
  IonInput,
  IonButton,
  IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  ellipsisVertical,
  attach,
  send,
  checkmark,
  checkmarkDone
} from 'ionicons/icons';
import { ChatMessage } from './chat.message';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonFooter,
    IonIcon,
    IonInput,
    IonButton,
    IonAvatar
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class ChatComponent {
  readonly draft = signal('');
  readonly messages = signal<ChatMessage[]>([
    {
      id: 1,
      text: 'Hey! Are you free to chat about the new push notification setup?',
      fromMe: false,
      timestamp: '14:02',
      status: undefined
    },
    {
      id: 2,
      text: 'Yeah, just read through the SignalR + OneSignal architecture. Looks solid!',
      fromMe: true,
      timestamp: '14:03',
      status: 'read'
    },
    {
      id: 3,
      text: 'Nice. Did you end up going with the ACK + debounce pattern?',
      fromMe: false,
      timestamp: '14:04',
      status: undefined
    },
    {
      id: 4,
      text: 'Yes — always push on ACK timeout, then batch summaries in a 60s window.',
      fromMe: true,
      timestamp: '14:05',
      status: 'delivered'
    },
    {
      id: 5,
      text: 'Perfect, that keeps us under the free-tier rolling limit.',
      fromMe: false,
      timestamp: '14:05',
      status: undefined
    }
  ]);

  constructor() {
    addIcons({ arrowBack, ellipsisVertical, attach, send, checkmark, checkmarkDone });
  }

  send(): void {
    const text = this.draft().trim();
    if (!text) return;
    const next: ChatMessage = {
      id: Date.now(),
      text,
      fromMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    this.messages.update((list) => [...list, next]);
    this.draft.set('');
  }
}
