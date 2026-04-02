import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private getStoredUser(): LoggedUser | null {
    try {
      const userJson =
        sessionStorage.getItem('user') ?? localStorage.getItem('user');
      return userJson ? (JSON.parse(userJson) as LoggedUser) : null;
    } catch {
      return null;
    }
  }

  currentUser = signal<LoggedUser | null>(this.getStoredUser());
  isLoggedIn = signal<boolean>(!!this.getStoredUser());

  login(userName: string, password: string): Observable<LoggedUser> {
    const body = new URLSearchParams();
    body.set('username', userName);
    body.set('password', password);

    return this.http
      .post(
        `${this.apiUrl}/api/auth/login`,
        body.toString(),
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
          withCredentials: true,
        }
      )
      .pipe(
        switchMap(() =>
          this.http.get<LoggedUser>(`${this.apiUrl}/api/auth/me`, { withCredentials: true })
        ),
        tap((me) => this.setSession(me))
      );
  }

  /**
   * Permette alla pagina di registrazione di usare direttamente la response del backend
   * senza fare un login aggiuntivo.
   */
  setSession(user: LoggedUser | null) {
    this.currentUser.set(user);
    this.isLoggedIn.set(!!user);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
    }
  }

  logout() {
    this.http.post(`${this.apiUrl}/api/auth/logout`, {}, { withCredentials: true }).subscribe();
    this.setSession(null);
    this.router.navigate(['/login']);
  }

  restoreSession() {
    const user = this.getStoredUser();
    this.setSession(user);
  }

  get isAdmin(): boolean {
    const roles = this.currentUser()?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }
}