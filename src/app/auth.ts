import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoggedUser {
  id: number;
  userName: string;
  email: string;
  roles: string[];
  city: string;
  address: string;
  bio: string;
  firstName: string;    // aggiunto
  lastName: string;     // aggiunto
  profileImage: string; // aggiunto
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

  private buildAuthHeader(username: string, password: string): HttpHeaders {
    const encoded = btoa(`${username}:${password}`);
    return new HttpHeaders({ Authorization: `Basic ${encoded}` });
  }

  login(userName: string, password: string): Observable<LoggedUser[]> {
    const headers = this.buildAuthHeader(userName, password);
    return this.http.get<LoggedUser[]>(`${this.apiUrl}/public`, { headers }).pipe(
      tap(users => {
        const me = users.find(u => u.userName === userName);
        if (me) {
          this.currentUser.set(me);
          this.isLoggedIn.set(true);
          sessionStorage.setItem('auth', btoa(`${userName}:${password}`));
          sessionStorage.setItem('user', JSON.stringify(me));
        }
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    sessionStorage.removeItem('auth');
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
    const encoded = sessionStorage.getItem('auth');
    return new HttpHeaders({ Authorization: `Basic ${encoded}` });
  }
}