import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin-service';
import { PortalUser } from '../model/entities';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],   // FIX: rimossi NgFor e NgIf (non servono con @for/@if)
  templateUrl: './admin-page.html',
  styleUrls: ['./admin-page.css']
})
export class AdminPage implements OnInit {
  private adminService = inject(AdminService);
  private location     = inject(Location);

  users   = signal<PortalUser[]>([]);
  loading = signal<boolean>(false);
  error   = signal<string | null>(null);

  searchAll    = '';
  searchBanned = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Errore nel caricamento della dashboard');
        this.loading.set(false);
      }
    });
  }

  // FIX: era u.banned → corretto in u.isBanned
  activeUsers = computed(() => this.users().filter(u => !u.isBanned));
  bannedUsers = computed(() => this.users().filter(u => u.isBanned));

  get filteredUsers(): PortalUser[] {
    const term = this.searchAll.toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.email.toLowerCase().includes(term) ||
      (u.userName && u.userName.toLowerCase().includes(term)) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
  }

  get filteredBanned(): PortalUser[] {
    const term = this.searchBanned.toLowerCase().trim();
    // FIX: era u.banned → corretto in u.isBanned
    const banned = this.users().filter(u => u.isBanned);
    if (!term) return banned;
    return banned.filter(u =>
      u.email.toLowerCase().includes(term) ||
      (u.userName && u.userName.toLowerCase().includes(term)) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
  }

  banUser(user: PortalUser): void {
    if (!user.userName) return;
    // FIX: era u.banned → corretto in u.isBanned
    const azione = user.isBanned ? 'sbannare' : 'bannare';
    if (confirm(`Sei sicuro di voler ${azione} l'utente ${user.userName}?`)) {
      this.adminService.banUser(user.userName).subscribe({
        next: (updatedUser: PortalUser) => {
          this.updateLocalUser(updatedUser);
        },
        error: () => {
          this.error.set('Impossibile comunicare con il server. Riprova più tardi.');
        }
      });
    }
  }

  unbanUser(user: PortalUser): void {
    this.banUser(user);
  }

  deleteUser(user: PortalUser): void {
    if (!user.id) return;
    if (confirm(`ATTENZIONE: Eliminare DEFINITIVAMENTE l'utente ${user.userName}? Questa azione non può essere annullata.`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.users.update(list => list.filter(u => u.id !== user.id));
        },
        error: () => {
          this.error.set("Impossibile eliminare l'utente. Potrebbe avere dei dati collegati.");
        }
      });
    }
  }

  private updateLocalUser(updatedUser: any): void {
    // il backend manda 'banned', l'entity usa 'isBanned' → normalizziamo
    const normalized: PortalUser = {
      ...updatedUser,
      isBanned: updatedUser.isBanned ?? updatedUser.banned ?? false,
    };
    this.users.update(list =>
      list.map(u => (u.id === normalized.id ? normalized : u))
    );
  }

  getInitials(user: PortalUser): string {
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName  ? user.lastName[0]  : '';
    return (f + l).toUpperCase() || '??';
  }

  hasRole(user: PortalUser, roleName: string): boolean {
    return user.roles?.includes(roleName) ?? false;
  }

  goBack(): void {
    this.location.back();
  }
}