import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin-service'; 
import { PortalUser } from '../model/entities';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.html',
  styleUrls: ['./admin-page.css']
})
export class AdminPage implements OnInit {
  private adminService = inject(AdminService);
  private location = inject(Location);

  users = signal<PortalUser[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  searchAll = '';
  searchBanned = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        console.log(data);
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Errore nel caricamento della dashboard");
        this.loading.set(false);
      }
    });
  }

  // Stats calcolate (Usa le parentesi () perché sono Signals)
  activeUsers = computed(() => this.users().filter(u => !u.banned));
  bannedUsers = computed(() => this.users().filter(u => u.banned));

  get filteredUsers(): PortalUser[] {
    const term = this.searchAll.toLowerCase().trim();
    return this.users().filter(u => 
      u.email.toLowerCase().includes(term) || 
      (u.userName && u.userName.toLowerCase().includes(term)) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
  }

  get filteredBanned(): PortalUser[] {
    const term = this.searchBanned.toLowerCase().trim();
    return this.bannedUsers().filter(u => 
      u.email.toLowerCase().includes(term) ||
      (u.userName && u.userName.toLowerCase().includes(term)) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
    );
  }

  // Poiché il backend usa lo stesso metodo per ban e unban (toggle)
  // possiamo unificare la logica o chiamare lo stesso metodo del service
  banUser(user: PortalUser): void {
    // Verifichiamo che l'utente abbia un username valido prima di procedere
    if (!user.userName) return;

    const azione = user.banned ? 'sbannare' : 'bannare';
    
    if (confirm(`Sei sicuro di voler ${azione} l'utente ${user.userName}?`)) {
      this.adminService.banUser(user.userName).subscribe({
        next: (updatedUser: PortalUser) => {
          // Aggiorniamo lo stato locale con l'oggetto restituito dal server
          this.updateLocalUser(updatedUser);
          console.log(`Utente ${updatedUser.userName} aggiornato. Stato ban: ${updatedUser.banned}`);
        },
        error: (err) => {
          console.error("Errore durante il ban/unban:", err);
          this.error.set("Impossibile comunicare con il server. Riprova più tardi.");
        }
      });
    }
  }

  unbanUser(user: PortalUser): void {
    // Chiamiamo lo stesso metodo perché il backend fa toggle
    this.banUser(user);
  }

  private updateLocalUser(updatedUser: PortalUser): void {
    this.users.update(list => 
      list.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );
    // I Signals 'activeUsers' e 'bannedUsers' si aggiorneranno automaticamente
  }

  getInitials(user: PortalUser): string {
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName ? user.lastName[0] : '';
    return (f + l).toUpperCase() || '??';
  }

  // Nel tuo AdminPage.ts
  hasRole(user: PortalUser, roleName: string): boolean {
    return user.roles?.includes(roleName) ?? false;
  }

  goBack(): void {
    this.location.back();
  }
}