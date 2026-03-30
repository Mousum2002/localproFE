import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PortalUser } from './model/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private adminUrl = 'http://localhost:8080/admin';

  /**
   * Recupera tutti gli utenti per la dashboard
   */
  public getAllUsers(): Observable<PortalUser[]> {
    return this.http.get<PortalUser[]>(this.adminUrl, { withCredentials: true });
  }

  /**
   * Gestisce sia il Ban che l'Unban (Toggle) tramite userName
   * Il backend usa @PutMapping("ban/{userName}")
   */
  public toggleBan(userName: string): Observable<PortalUser> {
    // Usiamo .put e passiamo lo userName nel path
    // Il corpo della richiesta {} è vuoto perché i dati sono nel path
    return this.http.put<PortalUser>(`${this.adminUrl}/ban/${userName}`, {}, { withCredentials: true });
  }

  // Se vuoi mantenere i nomi banUser/unbanUser per non cambiare AdminPage.ts
  // entrambi punteranno allo stesso metodo toggleBan
  public banUser(userName: string): Observable<PortalUser> {
    return this.toggleBan(userName);
  }

  public unbanUser(userName: string): Observable<PortalUser> {
    return this.toggleBan(userName);
  }

  public deleteUser(userId: number): Observable<void> {
    // Nota: aggiungiamo withCredentials se il backend è protetto
    return this.http.delete<void>(`http://localhost:8080/admin/delete/${userId}`, { withCredentials: true });
  }
}