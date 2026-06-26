import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-other',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatCardModule],
  template: `
    <div class="content-container">
      <mat-card class="item-card">
        <mat-card-content class="item-content">
          <mat-icon class="folder-icon">folder</mat-icon>
          <span>Zimmer 1</span>
          <button mat-icon-button aria-label="Edit room">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button aria-label="Delete room">
            <mat-icon>delete</mat-icon>
          </button>
          <span class="spacer"></span>
          <mat-icon class="chevron-icon">chevron_right</mat-icon>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }

      .item-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
})
export class OtherComponent {
  @Input() title = 'Other Menu Item';
}
