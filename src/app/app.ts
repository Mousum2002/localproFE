import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Auth } from './auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="nav-logo">LocalPro</a>
      <div class="nav-links">
        <a routerLink="/">Home</a>
        <a routerLink="/professionisti">Professionisti</a>
        @if (auth.isLoggedIn()) {
          <span class="nav-user">{{ auth.currentUser()?.userName }}</span>
          <button class="btn-logout" (click)="auth.logout()">Esci</button>
        } @else {
          <a routerLink="/login" class="btn-nav-login">Login / Registrati</a>
        }
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`
    .navbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 5%; background: #12201a;
      position: sticky; top: 0; z-index: 100;
    }
    .nav-logo {
      font-family: 'Georgia', serif; font-size: 1.4rem;
      color: #25a865; text-decoration: none;
    }
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-links a {
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-family: 'Courier New', monospace; font-size: 0.85rem;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: white; }
    .btn-nav-login {
      background: #25a865 !important;
      color: white !important;
      padding: 0.4rem 1.1rem;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      text-decoration: none;
      transition: background 0.2s !important;
    }
    .btn-nav-login:hover { background: #1a7a4a !important; }
    .nav-user { color: #25a865; font-family: 'Courier New', monospace; font-size: 0.85rem; }
    .btn-logout {
      background: none; border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.6); padding: 0.3rem 0.8rem;
      border-radius: 6px; cursor: pointer;
      font-family: 'Courier New', monospace; font-size: 0.8rem;
      transition: all 0.2s;
    }
    .btn-logout:hover { border-color: #ff6b7a; color: #ff6b7a; }
  `]
})
export class App implements OnInit {
  constructor(public auth: Auth) {}
  ngOnInit() { this.auth.restoreSession(); }
}