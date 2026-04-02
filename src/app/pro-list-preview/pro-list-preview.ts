import { Component, OnInit, signal } from '@angular/core';
import { ProCard } from '../pro-card/pro-card';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OperationType } from '../model/entities';
import { UserService } from '../user-service';
import { Auth } from '../auth';

@Component({
  selector: 'app-pro-list-preview',
  imports: [ProCard, FormsModule],
  templateUrl: './pro-list-preview.html',
  styleUrl: './pro-list-preview.css',
})
export class ProListPreview implements OnInit {

  allUsers = signal<any[]>([]);
  filteredUsers = signal<any[]>([]);
  operationTypes = signal<OperationType[]>([]);
  selectedTypeId: number | string = '';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    public auth: Auth
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.http.get<OperationType[]>('http://localhost:8089/api/operation-types')
      .subscribe(types => this.operationTypes.set(types));
  }


  //inutile
      loadUsers() {
  this.http.get<any[]>('http://localhost:8089/public')
    .subscribe(users => {
      const currentRoles = this.auth.currentUser()?.roles ?? [];
      const isAdmin = currentRoles.includes('ADMIN') || currentRoles.includes('ROLE_ADMIN');

      console.log('ruoli utente loggato:', currentRoles); // ← per debug
      console.log('è admin:', isAdmin);
      console.log('ruoli primo utente lista:', users[0]?.roles); // ← vedi come sono salvati

      const filtered = isAdmin
        ? users.filter(u =>  // admin vede tutti TRANNE se stesso
            u.id !== this.auth.currentUser()?.id
          )
        : users.filter(u =>  // user vede solo altri user non bannati
            !u.roles?.includes('ADMIN') &&
            !u.roles?.includes('ROLE_ADMIN') &&
            !u.isBanned
          );

      this.allUsers.set(filtered);
      this.filteredUsers.set(filtered);
    });
}

  filterByType() {
    if (!this.selectedTypeId) {
      this.filteredUsers.set(this.allUsers());
      return;
    }
    this.filteredUsers.set(
      this.allUsers().filter(u =>
        u.operationsProvided?.some((op: any) => op.operationType?.id === Number(this.selectedTypeId))
      )
    );
  }

  get isAdmin(): boolean {
    const roles = this.auth.currentUser()?.roles ?? [];
      return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }

  banUser(id: number) {
    this.http.put(`http://localhost:8089/admin/ban/${id}`, {}, { withCredentials: true })
      .subscribe(() => this.loadUsers());
  }

  unbanUser(id: number) {
    this.http.put(`http://localhost:8089/admin/unban/${id}`, {}, { withCredentials: true })
      .subscribe(() => this.loadUsers());
  }

  deleteUser(id: number) {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    this.http.delete(`http://localhost:8089/api/users/${id}`, { withCredentials: true })
      .subscribe(() => this.loadUsers());
  }



}