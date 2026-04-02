import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OperationTypeByVendor, PortalUser } from './model/entities';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/users`;
    private _allUsers: PortalUser[] | null = null;

    public getAllUsers(): Observable<PortalUser[]> {
        if (this._allUsers) {
          return of(this._allUsers);
        }
        return this.http.get<PortalUser[]>(this.apiUrl).pipe(
          tap(users => this._allUsers = users)
        );
    }

    public findByOperationType(operationTypeId: number): Observable<PortalUser[]> {
      return this.getAllUsers().pipe(
        map(users => users.filter(user => user.operationProvided?.some(op => op.operationType.id === operationTypeId)))
      )
    }

    //aggiunto durante la creazione di AdminPage.ts
    public banUser(userId: number): Observable<void> {
      return this.http.patch<void>(`${this.apiUrl}/${userId}/ban`, {}).pipe(
        tap(() => this.invalidateCache())
      );
    }

    //aggiunto durante la creazione di AdminPage.ts
    public unbanUser(userId: number): Observable<void> {
      return this.http.patch<void>(`${this.apiUrl}/${userId}/unban`, {}).pipe(
        tap(() => this.invalidateCache())
      );
    }

    //aggiunto durante la creazione di AdminPage.ts
    private invalidateCache(): void {
      this._allUsers = null;
    }
  
}