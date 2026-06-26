import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'view-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <button mat-icon-button aria-label="Back" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>{{ title() }}</span>
      <span class="app-toolbar-spacer"></span>
      <button mat-icon-button aria-label="Search">
        <mat-icon>search</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [
    `
      .app-toolbar-spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class ViewToolbar {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  protected readonly title = toSignal(
    this.router.events.pipe(
      map(() => this.router.routerState.snapshot.root.firstChild?.title ?? ''),
    ),
  );

  goBack(): void {
    this.location.back();
  }
}
