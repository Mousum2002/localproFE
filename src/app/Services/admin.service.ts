import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PortalUser } from '../model/entities';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private adminUrl = `${environment.apiUrl}/admin`;

  public getAllUsers(): Observable<PortalUser[]> {
    return this.http.get<PortalUser[]>(`${this.adminUrl}/all`, { withCredentials: true });
  }

  public toggleBan(userName: string): Observable<PortalUser> {
    return this.http.put<PortalUser>(`${this.adminUrl}/ban/${userName}`, {}, { withCredentials: true });
  }

  public banUser(userName: string): Observable<PortalUser> {
    return this.toggleBan(userName);
  }

  public unbanUser(userName: string): Observable<PortalUser> {
    return this.toggleBan(userName);
  }

  public deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/delete/${userId}`, { withCredentials: true });
  }
}

