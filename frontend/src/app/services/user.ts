import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

/**
 * Owns the current user id and keeps it in sync with the `?user=` query
 * param. The hub reads this signal to connect/reconnect on its own.
 *
 * The room parameter is intentionally not handled here — it stays local to
 * the chat page.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  static readonly DEFAULT_USER = 'A';

  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  /** Currently active user id. */
  readonly user = signal(UserService.DEFAULT_USER);

  constructor() {
    const fromUrl = this.readUserParam();
    const user = fromUrl?.trim() || UserService.DEFAULT_USER;
    this.user.set(user);

    // Ensure the default is present in the URL without rerendering.
    if (!fromUrl) {
      this.writeUserParam(user);
    }

    // Stay in sync with later navigations (back/forward, links, etc.).
    this.route.queryParams.subscribe((params) => {
      this.user.set(params['user']?.trim() || UserService.DEFAULT_USER);
    });
  }

  private readUserParam(): string | undefined {
    return new URLSearchParams(window.location.search).get('user') ?? undefined;
  }

  private writeUserParam(user: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set('user', user);
    this.location.replaceState(url.pathname, url.searchParams.toString());
  }
}
