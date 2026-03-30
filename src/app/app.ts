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
          @if (auth.isAdmin) {
            <a routerLink="/admin" class="btn-admin"> Admin</a>
          }
          <a routerLink="/profilo" class="avatar-btn" [title]="'Il mio profilo'">
            @if (auth.currentUser()?.profileImage) {
              <img [src]="auth.currentUser()?.profileImage" alt="avatar" class="avatar-img" />
            } @else {
              <span class="avatar-initials">{{ initials }}</span>
            }
          </a>
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
    .nav-logo { font-family: 'Georgia', serif; font-size: 1.4rem; color: #25a865; text-decoration: none; }
    .nav-links { display: flex; gap: 2rem; align-items: center; }
    .nav-links a {
      color: rgba(255,255,255,0.6); text-decoration: none;
      font-family: 'Courier New', monospace; font-size: 0.85rem; transition: color 0.2s;
    }
    .nav-links a:hover { color: white; }
    .btn-nav-login {
      background: #25a865 !important; color: white !important;
      padding: 0.4rem 1.1rem; border-radius: 6px;
      font-family: 'Courier New', monospace; font-size: 0.85rem;
      text-decoration: none; transition: background 0.2s !important;
    }
    .btn-nav-login:hover { background: #1a7a4a !important; }
    .btn-admin {
      background: rgba(255,193,7,0.12) !important;
      border: 1px solid rgba(255,193,7,0.35) !important;
      color: #ffc107 !important;
      padding: 0.3rem 0.9rem;
      border-radius: 6px;
      font-family: 'Courier New', monospace; font-size: 0.8rem;
      text-decoration: none !important;
      transition: background 0.2s !important;
    }
    .btn-admin:hover { background: rgba(255,193,7,0.22) !important; color: #ffd54f !important; }
    .avatar-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: #1e3328; border: 2px solid #25a865;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; cursor: pointer; text-decoration: none !important;
      transition: border-color 0.2s, transform 0.15s; flex-shrink: 0;
    }
    .avatar-btn:hover { border-color: #1a7a4a; transform: scale(1.05); }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials { font-size: 0.85rem; font-weight: 700; color: #25a865; font-family: 'Georgia', serif; }
    .btn-logout {
      background: none; border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.6); padding: 0.3rem 0.8rem;
      border-radius: 6px; cursor: pointer;
      font-family: 'Courier New', monospace; font-size: 0.8rem; transition: all 0.2s;
    }
    .btn-logout:hover { border-color: #ff6b7a; color: #ff6b7a; }
  `]
})
export class App implements OnInit {
  constructor(public auth: Auth) {}
  ngOnInit() { this.auth.restoreSession(); }

  get initials(): string {
    const user = this.auth.currentUser();
    const f = user?.firstName?.[0]?.toUpperCase() ?? '';
    const l = user?.lastName?.[0]?.toUpperCase()  ?? '';
    return (f + l) || user?.userName?.[0]?.toUpperCase() || '?';
  }
}