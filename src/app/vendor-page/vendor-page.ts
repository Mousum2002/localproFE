import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';
import { environment } from '../../environments/environment';
import { PrenotazioneService } from '../Services/pernotazione.service';
import { SnackbarService } from '../Services/snackbar.service';

@Component({
  selector: 'app-vendor-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './vendor-page.html',
  styleUrl: './vendor-page.css',
})
export class VendorPage implements OnInit {

  vendor    = signal<any | null>(null);
  loading   = signal(true);
  error     = signal('');

  // Form recensione
  newRating      = 0;
  newDescription = '';
  reviewLoading  = signal(false);
  reviewSuccess  = signal(false);
  reviewError    = signal('');
  hoveredStar    = 0;

  // --- MODAL PRENOTAZIONE ---
  bookingModal   = signal<any | null>(null); // servizio selezionato
  bookingDate    = '';
  bookingNote    = '';
  bookingLoading = signal(false);
  bookingSuccess = signal(false);
  bookingError   = signal('');

  // data minima = oggi
  get minDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

  private vendorId = 0;
  private baseUrl  = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    public auth: AuthService,
    private prenotazioneService: PrenotazioneService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    this.vendorId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadVendor();
  }

  loadVendor() {
    this.loading.set(true);
    this.http.get<any>(`${this.baseUrl}/public/vendor/${this.vendorId}`)
      .subscribe({
        next:  v  => { this.vendor.set(v); this.loading.set(false); },
        error: () => { this.error.set('Profilo non trovato.'); this.loading.set(false); }
      });
  }

  openBooking(service: any) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.bookingModal.set(service);
    this.bookingDate = '';
    this.bookingNote = '';
    this.bookingError.set('');
    this.bookingSuccess.set(false);
  }

  closeBooking() {
    this.bookingModal.set(null);
    this.bookingSuccess.set(false);
  }

  confirmBooking() {
    if (!this.bookingDate) {
      this.bookingError.set('Seleziona una data per il servizio.');
      return;
    }
    const svc = this.bookingModal();
    if (!svc) return;

    this.bookingLoading.set(true);
    this.bookingError.set('');

    this.prenotazioneService.createPrenotazione({
      serviceId: svc.id,
      note: this.bookingNote,
      reservationDate: new Date(this.bookingDate).toISOString().slice(0, 19),
    }).subscribe({
      next: () => {
        this.bookingLoading.set(false);
        this.bookingSuccess.set(true);
        this.snackbar.show('Prenotazione effettuata con successo!', 'success');
      },
      error: () => {
        this.bookingLoading.set(false);
        this.bookingError.set('Errore durante la prenotazione. Riprova.');
        this.snackbar.show('Errore durante la prenotazione. Riprova.', 'error');
      }
    });
  }

  submitReview() {
    if (this.newRating === 0) { this.reviewError.set('Seleziona una valutazione.'); return; }
    if (!this.newDescription.trim()) { this.reviewError.set('Scrivi un commento.'); return; }

    this.reviewLoading.set(true);
    this.reviewError.set('');

    this.http.post(`${this.baseUrl}/api/reviews`,
      { userId: this.vendorId, rating: this.newRating, description: this.newDescription.trim() },
      { withCredentials: true }
    ).subscribe({
      next: (created: any) => {
        this.reviewLoading.set(false);
        this.reviewSuccess.set(true);
        this.newRating = 0;
        this.newDescription = '';
        // aggiunge la recensione localmente senza ricaricare tutto
        const v = this.vendor();
        if (v) {
          this.vendor.set({ ...v, reviews: [...(v.reviews ?? []), created] });
        }
        setTimeout(() => this.reviewSuccess.set(false), 3000);
      },
      error: () => {
        this.reviewLoading.set(false);
        this.reviewError.set('Errore durante l\'invio. Riprova.');
      }
    });
  }

  deleteReview(reviewId: number) {
    if (!confirm('Eliminare questa recensione?')) return;
    this.http.delete(`${this.baseUrl}/api/reviews/${reviewId}`, { withCredentials: true })
      .subscribe({
        next: () => {
          const v = this.vendor();
          if (v) this.vendor.set({ ...v, reviews: v.reviews.filter((r: any) => r.id !== reviewId) });
          this.snackbar.show('Recensione eliminata.', 'success');
        },
        error: () => this.snackbar.show('Impossibile eliminare la recensione.', 'error')
      });
  }

  // Può cancellare se è il recensore o se sta guardando il proprio profilo
  canDelete(review: any): boolean {
    const me = this.auth.currentUser();
    if (!me) return false;
    return review.userName === me.userName || me.id === this.vendorId;
  }

  get isOwnProfile(): boolean {
    return this.auth.currentUser()?.id === this.vendorId;
  }

  get starsArray() { return [1, 2, 3, 4, 5]; }

  get initials(): string {
    const v = this.vendor();
    if (!v) return '?';
    const f = v.firstName?.[0]?.toUpperCase() ?? '';
    const l = v.lastName?.[0]?.toUpperCase()  ?? '';
    return (f + l) || v.userName?.[0]?.toUpperCase() || '?';
  }
}