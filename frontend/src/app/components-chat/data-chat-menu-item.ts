import {
  Component,
  OnDestroy,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ChatService } from '../services/chat';
import { ViewMainMenuItem } from '../components-layout/view-main-menu-item';

@Component({
  selector: 'data-chat-menu-item',
  imports: [ViewMainMenuItem],
  template: `
    <view-main-menu-item
      [label]="label()"
      [link]="link()"
      [icon]="icon()"
      [badge]="count() || null"
    />
  `,
})
export class DataChatMenuItem implements OnDestroy {
  private readonly hub = inject(ChatService);

  readonly label = input.required<string>();
  readonly link = input.required<string>();
  readonly icon = input.required<string>();
  readonly room = input<string>('common');

  readonly count = signal(0);
  private unsubscribe?: () => void;

  constructor() {
    effect(() => {
      this.unsubscribe?.();
      this.unsubscribe = this.hub.onCounts(this.room(), (next) => {
        this.count.set(next);
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
