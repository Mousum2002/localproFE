import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AuthService } from '../Services/auth.service';
import { environment } from '../../environments/environment';
import { OperationService } from '../Services/operations.service';
import { PrenotazioneService } from '../Services/pernotazione.service';
import { ReviewService } from '../Services/review.service';
import { LocationService } from '../Services/localtion-service';
import { of, switchMap, catchError } from 'rxjs';

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
  address         = '';
  city            = '';
  editDescription = '';
  profileImageUrl = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  myBookings = signal<any[]>([]);
  incomingBookings = signal<any[]>([]);
  incomingActionLoadingId = signal<number | null>(null);
  myServices = signal<any[]>([]);
  reviews    = computed(() => this.reviewService.reviews());

  averageRating = computed(() => {
    const revs = this.reviews();
    if (revs.length === 0) return 0;
    const sum = revs.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / revs.length).toFixed(1);
  });

  bookingTab = signal<'tutti' | 'in-attesa' | 'confermato' | 'completato' | 'cancellata'>('tutti');
  serviceTab = signal<'tutti' | 'in-attesa' | 'confermato' | 'completato' | 'cancellata'>('tutti');

  editingService = signal<any | null>(null);
  editPrice      = 0;
  editSaving     = signal(false);

  loading = signal(false);
  success = signal(false);
  error   = signal('');

  private apiBase      = environment.apiUrl;
  private usersUrl    = `${this.apiBase}/api/users`;
  private bookingsUrl = `${this.apiBase}/api/prenotazioni`;
  private vendorUrl   = `${this.apiBase}/api/vendor-operations`;
  private opTypesUrl  = `${this.apiBase}/public/operation-types`;

  operationTypes      = signal<any[]>([]);
  editOperationTypeId = 0;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private prenotazioneService: PrenotazioneService,
    private reviewService: ReviewService,
    private operations: OperationService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.firstName       = user.firstName    ?? '';
      this.lastName        = user.lastName     ?? '';
      this.bio             = user.bio          ?? '';
      this.address         = user.address      ?? '';
      this.city            = user.city         ?? '';
      this.profileImageUrl = user.profileImage ?? '';
      this.loadReviews(user.userName);  //aggiunto
    }
    this.loadBookings();
    this.loadIncomingBookings();
    this.loadMyServices();
    this.loadOperationTypes();
  }

  loadReviews(userName: string) {
    this.reviewService.loadVendorReviews(userName);
  }

  loadBookings() {
    this.prenotazioneService.getUserPrenotazioni().subscribe({
      next: (b) => this.myBookings.set(b as any),
      error: () => {},
    });
  }

  cancelBooking(id: number) {
    if (!confirm('Annullare questa prenotazione?')) return;
    this.prenotazioneService.cancelPrenotazione(id).subscribe({
      next: () => {
        this.myBookings.update((list) =>
          list.map((b) => (b.id === id ? { ...b, status: 'Cancellata' } : b)),
        );
      },
    });
  }

  loadIncomingBookings() {
    this.prenotazioneService.getVendorPrenotazioni().subscribe({
      next: (b) => this.incomingBookings.set(b as any),
      error: () => {},
    });
  }

  private updateIncomingStatus(id: number, status: string) {
    this.incomingActionLoadingId.set(id);
    this.prenotazioneService.updatePrenotazioneStatus(id, status).subscribe({
      next: () => {
        this.incomingBookings.update((list) =>
          list.map((b) => (b.id === id ? { ...b, status } : b)),
        );
      },
      error: () => {
        // Keep UI unchanged on error.
      },
      complete: () => this.incomingActionLoadingId.set(null),
    });
  }

  acceptIncoming(b: any) {
    if (!b?.id) return;
    if (!confirm('Accettare questa prenotazione?')) return;
    this.updateIncomingStatus(b.id, 'Confermato');
  }

  rejectIncoming(b: any) {
    if (!b?.id) return;
    if (!confirm('Rifiutare questa prenotazione?')) return;
    this.updateIncomingStatus(b.id, 'Cancellata');
  }

  completeIncoming(b: any) {
    if (!b?.id) return;
    if (!confirm('Segnare questa prenotazione come completata?')) return;
    this.updateIncomingStatus(b.id, 'Completato');
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
    const user = this.auth.currentUser();
    if (!user) return;

    // Preferiamo evitare un'altra chiamata backend usando la lista cache in `OperationService`.
    const cached = this.operations.Operations();
    if (cached.length > 0) {
      const filtered = cached.filter((op: any) => op.userName === user.userName || op.userId === user.id);
      const mapped = filtered.map((op: any) => ({
        ...op,
        // normalizziamo i campi che la UI si aspetta per modifica/eliminazione
        operationTypeId: op.operationTypeId ?? op.operationType?.id,
        operationTypeName: op.operationTypeName ?? op.category ?? op.operationType?.name,
        operationTypeDescription: op.operationTypeDescription ?? op.description ?? op.operationType?.description,
      }));

      const hasValidTypeId = mapped.some((s: any) => s.operationTypeId !== undefined && s.operationTypeId !== null);
      if (mapped.length > 0 && hasValidTypeId) {
        this.myServices.set(mapped);
        return;
      }
    }

    // Fallback: se la lista cache non contiene i campi necessari (operationTypeId ecc) usiamo il backend.
    const userId = user.id;
    if (!userId) return;
    this.http.get<any[]>(`${this.vendorUrl}?vendorId=${userId}`, { withCredentials: true }).subscribe({
      next: (s) => this.myServices.set(s),
      error: () => {},
    });
  }

  loadOperationTypes() {
    this.http.get<any[]>(this.opTypesUrl)
      .subscribe({ next: types => this.operationTypes.set(types) });
  }

  filteredServices = computed(() => this.myServices());

  deleteService(id: number) {
    if (!confirm('Eliminare questo servizio?')) return;
    this.operations.deleteOperation(id).subscribe(() => this.loadMyServices());
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
    this.operations.updateOperation(svc.id, { operationTypeId: this.editOperationTypeId, price: this.editPrice }).subscribe({
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

    const addressInput = (this.address ?? '').trim();
    const cityInput = (this.city ?? '').trim();
    const query = [addressInput, cityInput].filter(Boolean).join(', ');

    const fallbackCoords = { x: user.x ?? 0, y: user.y ?? 0 };

    // Signup/profile: proviamo prima a geocodificare l'indirizzo inserito,
    // e se fallisce usiamo un fallback di geolocalizzazione (browser/ip).
    // Regola: prima validiamo l'indirizzo scritto.
    // Se non è valido, allora chiediamo permesso posizione (browser) e poi IP fallback (interno al service).
    // Se l'utente non ha modificato/fornito indirizzo, non chiediamo permessi.
    const coords$ = query
      ? this.locationService.getLocationFromAddress(query).pipe(
          switchMap((coords) => coords ? of(coords) : this.locationService.getLocationFromBrowser())
        )
      : of(null);

    coords$
      .pipe(
        catchError(() => of(null)),
        switchMap((coords) => {
          const x = coords?.x ?? fallbackCoords.x;
          const y = coords?.y ?? fallbackCoords.y;
          const finalCity = cityInput || coords?.city || user.city || '';

          const body: any = {
            userName: user.userName,
            email: user.email,
            password: 'UNCHANGED',
            firstName: this.firstName,
            lastName: this.lastName,
            bio: this.bio,
            city: finalCity,
            address: addressInput,
            x,
            y,
            profileImage: this.previewUrl || this.profileImageUrl,
          };

          return this.http.put<any>(`${this.usersUrl}/${user.id}`, body, { withCredentials: true });
        })
      )
      .subscribe({
        next: (updated: any) => {
          this.loading.set(false);
          this.success.set(true);

          const newUser = {
            ...user,
            firstName: updated.firstName,
            lastName: updated.lastName,
            bio: updated.bio,
            city: updated.city,
            address: updated.address,
            profileImage: updated.profileImage,
          };

          this.auth.currentUser.set(newUser);
          sessionStorage.setItem('user', JSON.stringify(newUser));

          this.previewUrl = null;
          this.profileImageUrl = updated.profileImage;

          setTimeout(() => this.success.set(false), 3000);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Salvataggio fallito. Riprova.');
        },
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