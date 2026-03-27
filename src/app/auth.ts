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
  private apiUrl = 'http://localhost:8089';

  currentUser = signal<LoggedUser | null>(null);
  isLoggedIn  = signal<boolean>(false);

  login(userName: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', userName);
    body.set('password', password);

    return this.http.post(`${this.apiUrl}/api/auth/login`, body.toString(), {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      withCredentials: true
    }).pipe(
      tap(() => {
        this.isLoggedIn.set(true);
        this.http.get<any[]>(`${this.apiUrl}/public`, { withCredentials: true })
          .subscribe(users => {
            const me = users.find((u: any) => u.userName === userName);
            if (me) {
              this.currentUser.set(me);
              sessionStorage.setItem('user', JSON.stringify(me));
            }
          });
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
    const encoded = sessionStorage.getItem('auth');
    return new HttpHeaders({ Authorization: `Basic ${encoded}` });
  }
}