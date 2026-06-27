import { Component, input } from '@angular/core';
import { DataChat } from '../components-chat/data-chat';

@Component({
  selector: 'page-chat',
  imports: [DataChat],
  template: `
    <data-chat [room]="room()" />
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
  /** Room name, bound from the `messages/:room` route parameter. */
  readonly room = input.required<string>();
}
