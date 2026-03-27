import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface PortalUser {
  id: number;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isBanned: boolean;
  roles: string[];
}

@Component({
  selector: 'app-admin-page',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {

  users: PortalUser[] = [];

  searchAll    = '';
  searchBanned = '';

  loading = signal(false);
  error   = signal('');

  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  // ── Data fetching ──────────────────────────────────

  loadUsers() {
    this.loading.set(true);
    this.error.set('');

    this.http.get<PortalUser[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: (data) => {
        this.users = data;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare gli utenti. Riprova.');
        this.loading.set(false);
      },
    });
  }

  // ── Computed lists ─────────────────────────────────

  get bannedUsers(): PortalUser[] {
    return this.users.filter(u => u.isBanned);
  }

  get activeUsers(): PortalUser[] {
    return this.users.filter(u => !u.isBanned);
  }

  get filteredUsers(): PortalUser[] {
    const q = this.searchAll.toLowerCase().trim();
    if (!q) return this.users;
    return this.users.filter(u => this.matchesQuery(u, q));
  }

  get filteredBanned(): PortalUser[] {
    const q = this.searchBanned.toLowerCase().trim();
    const banned = this.bannedUsers;
    if (!q) return banned;
    return banned.filter(u => this.matchesQuery(u, q));
  }

  // ── Actions ────────────────────────────────────────

  banUser(user: PortalUser) {
    this.http
      .put(`${this.apiUrl}/${user.id}/ban`, {}, { withCredentials: true })
      .subscribe({
        next: () => { user.isBanned = true; },
        error: () => this.error.set(`Impossibile bannare @${user.userName}.`),
      });
  }

  unbanUser(user: PortalUser) {
    this.http
      .put(`${this.apiUrl}/${user.id}/unban`, {}, { withCredentials: true })
      .subscribe({
        next: () => { user.isBanned = false; },
        error: () => this.error.set(`Impossibile rimuovere ban a @${user.userName}.`),
      });
  }

  goBack() {
    this.router.navigate(['/profilo']);
  }

  // ── Helpers ────────────────────────────────────────

  getInitials(u: PortalUser): string {
    const f = u.firstName?.[0]?.toUpperCase() ?? '';
    const l = u.lastName?.[0]?.toUpperCase()  ?? '';
    return (f + l) || u.userName[0]?.toUpperCase() || '?';
  }

  hasRole(u: PortalUser, role: string): boolean {
    return (u.roles ?? []).some(r => r === role || r === `ROLE_${role}`);
  }

  private matchesQuery(u: PortalUser, q: string): boolean {
    return (
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)    ||
      (u.firstName ?? '').toLowerCase().includes(q) ||
      (u.lastName  ?? '').toLowerCase().includes(q)
    );
  }
}