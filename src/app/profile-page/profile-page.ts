import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Auth } from '../auth';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {

  // dati profilo
  firstName = '';
  lastName = '';
  bio = '';
  profileImageUrl = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // prenotazioni fatte da me
  myBookings = signal<any[]>([]);

  // servizi che offro
  myServices = signal<any[]>([]);

  loading = signal(false);
  success = signal(false);
  error = signal('');

  private apiUrl      = 'http://localhost:8080/api/users';
  private bookingsUrl = 'http://localhost:8080/api/bookings';
  private vendorUrl   = 'http://localhost:8080/api/vendor-operations';
  private bookingsUrl = 'http://localhost:8080/api/prenotazioni';

  constructor(public auth: Auth, private http: HttpClient) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.firstName       = user.firstName    ?? '';
      this.lastName        = user.lastName     ?? '';
      this.bio             = user.bio          ?? '';
      this.profileImageUrl = user.profileImage ?? '';
    }
    this.loadBookings();
    this.loadMyServices();
  }

  // ── PRENOTAZIONI ─────────────────────────────────────────

  loadBookings() {
    this.http.get<any[]>(`${this.bookingsUrl}/mine`, { withCredentials: true })
      .subscribe({
        next: bookings => this.myBookings.set(bookings),
        error: () => {}
      });
  }

  cancelBooking(id: number) {
    if (!confirm('Annullare questa prenotazione?')) return;
    this.http.patch(`${this.bookingsUrl}/${id}/cancel`, {}, { withCredentials: true })
      .subscribe(() => this.loadBookings());
  }

  bookingStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING:   '⏳ In attesa',
      CONFIRMED: '✅ Confermata',
      COMPLETED: '🏁 Completata',
      CANCELLED: '❌ Annullata',
    };
    return map[status] ?? status;
  }

  bookingStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'status-pending',
      CONFIRMED: 'status-confirmed',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
    };
    return map[status] ?? '';
  }

  // ── SERVIZI OFFERTI ───────────────────────────────────────

  loadMyServices() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.http.get<any[]>(`${this.vendorUrl}?vendorId=${userId}`, { withCredentials: true })
      .subscribe({
        next: services => this.myServices.set(services),
        error: () => {}
      });
  }

  deleteService(id: number) {
    if (!confirm('Eliminare questo servizio? Non sarà più visibile nella lista.')) return;
    this.http.delete(`${this.vendorUrl}/${id}`, { withCredentials: true })
      .subscribe(() => this.loadMyServices());
  }

  // ── FOTO PROFILO ──────────────────────────────────────────

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // ── SALVA PROFILO ─────────────────────────────────────────

  save() {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    const body: any = {
      userName:     user.userName,
      email:        user.email,
      password:     'UNCHANGED',
      firstName:    this.firstName,
      lastName:     this.lastName,
      bio:          this.bio,
      city:         user.city    ?? '',
      address:      user.address ?? '',
      x:            user.x       ?? 0,
      y:            user.y       ?? 0,
      profileImage: this.previewUrl ?? this.profileImageUrl,
    };

    this.http.put(`${this.apiUrl}/${user.id}`, body, { withCredentials: true })
      .subscribe({
        next: (updated: any) => {
          this.loading.set(false);
          this.success.set(true);
          const newUser = {
            ...user,
            bio:          updated.bio,
            firstName:    updated.firstName,
            lastName:     updated.lastName,
            profileImage: updated.profileImage,
          };
          this.auth.currentUser.set(newUser);
          sessionStorage.setItem('user', JSON.stringify(newUser));
          setTimeout(() => this.success.set(false), 3000);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Salvataggio fallito. Riprova.');
        },
      });
  }

  // ── GETTERS ───────────────────────────────────────────────

  get initials(): string {
    const f = this.firstName?.[0]?.toUpperCase() ?? '';
    const l = this.lastName?.[0]?.toUpperCase()  ?? '';
    return (f + l) || this.auth.currentUser()?.userName?.[0]?.toUpperCase() || '?';
  }

  get isAdmin(): boolean {
    const roles = this.auth.currentUser()?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }
}