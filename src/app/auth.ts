import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';

export interface LoggedUser {
  id: number;
  userName: string;
  email: string;
  roles: string[];
  city: string;
  address: string;
  bio: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class Auth {

  private http   = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080';

  currentUser = signal<LoggedUser | null>(null);
  isLoggedIn  = signal<boolean>(false);

  login(userName: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', userName);
    body.set('password', password);

    return this.http.post(
      `${this.apiUrl}/api/auth/login`,
      body.toString(),
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
        withCredentials: true,
      }
    ).pipe(
      switchMap(() =>
        // carica solo i dati dell'utente loggato — funziona per tutti!
        this.http.get<LoggedUser>(`${this.apiUrl}/api/auth/me`, { withCredentials: true })
      ),
      tap(me => {
        if (me) {
          this.currentUser.set(me);
          this.isLoggedIn.set(true);
          sessionStorage.setItem('user', JSON.stringify(me));
        }
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/api/auth/logout`, {}, { withCredentials: true })
      .subscribe();
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  restoreSession() {
    const user = sessionStorage.getItem('user');
    if (user) {
      this.currentUser.set(JSON.parse(user));
      this.isLoggedIn.set(true);
    }
  }

  getAuthHeader(): HttpHeaders {
    return new HttpHeaders({});
  }

  get isAdmin(): boolean {
    const roles = this.currentUser()?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }
}