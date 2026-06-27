import { Component, input, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'view-main-menu-group',
  imports: [MatListModule, MatIconModule],
  template: `
    <a
      mat-list-item
      (click)="toggle()"
      class="view-main-menu-group-header"
    >
      <mat-icon matListItemIcon class="view-main-menu-group-toggle">
        {{ expanded() ? 'expand_less' : 'expand_more' }}
      </mat-icon>
      <span matListItemTitle class="view-main-menu-expansion-title">{{ label() }}</span>
    </a>

    @if (expanded()) {
      <div class="view-main-menu-sub-list">
        <ng-content />
      </div>
    }
  `
})
export class ViewMainMenuGroup {
  readonly label = input.required<string>();
  readonly expanded = signal(false);

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
