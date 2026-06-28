import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'view-main-menu-item',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatBadgeModule],
  template: `
    <a
      mat-list-item
      [routerLink]="link()"
      routerLinkActive="view-main-menu-item-active"
      queryParamsHandling="preserve"
    >
      <mat-icon
        matListItemIcon
        [matBadge]="badge()"
        matBadgeColor="warn"
        matBadgeSize="medium"
        matBadgePosition="above after"
      >{{ icon() }}</mat-icon>
      <span matListItemTitle>{{ label() }}</span>
    </a>
  `,
})
export class ViewMainMenuItem {
  readonly label = input.required<string>();
  readonly link = input.required<string>();
  readonly icon = input.required<string>();
  readonly badge = input<number | null>(null);
}
