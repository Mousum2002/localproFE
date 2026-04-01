import { Component, OnInit, signal, computed } from '@angular/core';
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

  firstName       = '';
  lastName        = '';
  bio             = '';
  editDescription = '';
  profileImageUrl = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  myBookings = signal<any[]>([]);
  myServices = signal<any[]>([]);

  bookingTab = signal<'tutti' | 'in-attesa' | 'confermato' | 'completato' | 'cancellata'>('tutti');
  serviceTab = signal<'tutti' | 'in-attesa' | 'confermato' | 'completato' | 'cancellata'>('tutti');

  editingService = signal<any | null>(null);
  editPrice      = 0;
  editSaving     = signal(false);

  loading = signal(false);
  success = signal(false);
  error   = signal('');

  private apiUrl      = 'http://localhost:8080/api/users';
  private bookingsUrl = 'http://localhost:8080/api/prenotazioni';
  private vendorUrl   = 'http://localhost:8080/api/vendor-operations';
  private opTypesUrl  = 'http://localhost:8080/api/operation-types';

  operationTypes      = signal<any[]>([]);
  editOperationTypeId = 0;

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
    this.loadOperationTypes();
  }

  // ── PRENOTAZIONI ─────────────────────────────────────────

  loadBookings() {
    this.http.get<any[]>(`${this.bookingsUrl}/getOutoingPrenotazioni`, { withCredentials: true })
      .subscribe({ next: b => this.myBookings.set(b), error: () => {} });
  }

  cancelBooking(id: number) {
    if (!confirm('Annullare questa prenotazione?')) return;
    this.http.delete(`${this.bookingsUrl}/${id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.myBookings.update(list =>
            list.map(b => b.id === id ? { ...b, status: 'Cancellata' } : b)
          );
        }
      });
  }

  filteredBookings = computed(() => {
    const tab = this.bookingTab();
    const all = this.myBookings();
    if (tab === 'tutti') return all;
    const map: Record<string, string> = {
      'in-attesa': 'Creato', 'confermato': 'Confermato',
      'completato': 'Completato', 'cancellata': 'Cancellata',
    };
    return all.filter(b => b.status === map[tab]);
  });

  bookingStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Creato': '⏳ In attesa', 'Confermato': '✅ Confermata',
      'Completato': '🏁 Completata', 'Cancellata': '❌ Annullata',
    };
    return map[status] ?? status;
  }

  bookingStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Creato': 'status-pending', 'Confermato': 'status-confirmed',
      'Completato': 'status-completed', 'Cancellata': 'status-cancelled',
    };
    return map[status] ?? '';
  }

  bookingTabCount(tab: string): number {
    if (tab === 'tutti') return this.myBookings().length;
    const map: Record<string, string> = {
      'in-attesa': 'Creato', 'confermato': 'Confermato',
      'completato': 'Completato', 'cancellata': 'Cancellata',
    };
    return this.myBookings().filter(b => b.status === map[tab]).length;
  }

  setBookingTab(tab: string) {
    this.bookingTab.set(tab as any);
  }

  setServiceTab(tab: string) {
    this.serviceTab.set(tab as any);
  }

  // ── SERVIZI OFFERTI ───────────────────────────────────────

  loadMyServices() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    // FIX critico: aggiunto ?vendorId per filtrare solo i servizi dell'utente
    this.http.get<any[]>(`${this.vendorUrl}?vendorId=${userId}`, { withCredentials: true })
      .subscribe({ next: s => this.myServices.set(s), error: () => {} });
  }

  loadOperationTypes() {
    this.http.get<any[]>(this.opTypesUrl, { withCredentials: true })
      .subscribe({ next: types => this.operationTypes.set(types) });
  }

  filteredServices = computed(() => this.myServices());

  deleteService(id: number) {
    if (!confirm('Eliminare questo servizio?')) return;
    this.http.delete(`${this.vendorUrl}/${id}`, { withCredentials: true })
      .subscribe(() => this.loadMyServices());
  }

  startEdit(service: any) {
    this.editingService.set(service);
    this.editPrice = service.price;
    this.editOperationTypeId = service.operationTypeId ?? 0;
    // Il DTO ha campi piatti: operationTypeName, operationTypeDescription
    this.editDescription = service.operationTypeDescription ?? '';
  }

  cancelEdit() { this.editingService.set(null); }

  saveEdit() {
    const svc = this.editingService();
    if (!svc) return;
    this.editSaving.set(true);
    this.http.put(`${this.vendorUrl}/${svc.id}`,
      { operationTypeId: this.editOperationTypeId, price: this.editPrice },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.editSaving.set(false);
        this.editingService.set(null);
        this.myServices.update(list =>
          list.map(s => s.id === svc.id
            ? { ...s, price: this.editPrice, operationTypeDescription: this.editDescription, operationTypeId: this.editOperationTypeId, operationTypeName: this.operationTypes().find(t => t.id === this.editOperationTypeId)?.name ?? s.operationTypeName }
            : s
          )
        );
      },
      error: () => { this.editSaving.set(false); }
    });
  }

  // ── FOTO PROFILO ──────────────────────────────────────────

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) { this.error.set('Immagine troppo grande (max 2MB)'); return; }
      const reader = new FileReader();
      reader.onload = () => { this.previewUrl = reader.result as string; };
      reader.readAsDataURL(file);
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
      userName: user.userName, email: user.email, password: 'UNCHANGED',
      firstName: this.firstName, lastName: this.lastName, bio: this.bio,
      city: user.city ?? '', address: user.address ?? '',
      x: user.x ?? 0, y: user.y ?? 0,
      profileImage: this.previewUrl || this.profileImageUrl,
    };

    this.http.put(`${this.apiUrl}/${user.id}`, body, { withCredentials: true })
      .subscribe({
        next: (updated: any) => {
          this.loading.set(false);
          this.success.set(true);
          const newUser = { ...user, bio: updated.bio, firstName: updated.firstName, lastName: updated.lastName, profileImage: updated.profileImage };
          this.auth.currentUser.set(newUser);
          sessionStorage.setItem('user', JSON.stringify(newUser));
          this.previewUrl = null;
          this.profileImageUrl = updated.profileImage;
          setTimeout(() => this.success.set(false), 3000);
        },
        error: () => { this.loading.set(false); this.error.set('Salvataggio fallito. Riprova.'); },
      });
  }

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