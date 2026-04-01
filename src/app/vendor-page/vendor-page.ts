import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../auth';

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

  private vendorId = 0;
  private baseUrl  = 'http://localhost:8080';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    public auth: Auth
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

  bookService(serviceId: number) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.http.post(`${this.baseUrl}/api/prenotazioni`, { serviceId, note: '' }, { withCredentials: true })
      .subscribe({
        next:  () => alert('Prenotazione effettuata con successo!'),
        error: () => alert('Errore durante la prenotazione. Riprova.'),
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
        },
        error: () => alert('Impossibile eliminare la recensione.')
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