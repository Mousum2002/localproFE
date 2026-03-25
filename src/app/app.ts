import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="nav-logo">LocalPro</a>
      <div class="nav-links">
        <a routerLink="/">Home</a>
        <a routerLink="/professionisti">Professionisti</a>
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 5%;
      background: #12201a;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-logo {
      font-family: 'Georgia', serif;
      font-size: 1.4rem;
      color: #25a865;
      text-decoration: none;
    }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a {
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: white; }
  `]
})
export class App {}