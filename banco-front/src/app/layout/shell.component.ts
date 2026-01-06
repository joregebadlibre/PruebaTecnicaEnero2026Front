import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-header__content">
          <div class="app-header__brand">
            <span class="app-header__icon" aria-hidden="true">🏦</span>
            <span class="app-header__title">BANCO</span>
          </div>
        </div>
      </header>

      <div class="app-body">
        <aside class="app-sidebar" aria-label="Navigation">
          <nav class="app-nav">
            <a class="app-nav__link" routerLink="/clientes" routerLinkActive="is-active">Clientes</a>
            <a class="app-nav__link" routerLink="/cuentas" routerLinkActive="is-active">Cuentas</a>
            <a class="app-nav__link" routerLink="/movimientos" routerLinkActive="is-active">Movimientos</a>
            <a class="app-nav__link" routerLink="/reportes" routerLinkActive="is-active">Reportes</a>
          </nav>
        </aside>

        <main class="app-main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './shell.component.css',
})
export class ShellComponent {}
