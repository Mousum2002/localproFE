import { Component, OnInit,  OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { OperationService } from '../Services/operations.service';
import { OperationListItem } from '../model/Operations';
import { MapService } from '../Services/map-service';
import { PrenotazioneService } from '../Services/pernotazione.service';
import { SnackbarService } from '../Services/snackbar.service';

@Component({
  selector: 'app-service-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './service-page.html',
  styleUrl: './service-page.css',
})
export class ServicePage implements OnInit, OnDestroy {
  allServices      = signal<OperationListItem[]>([]);
  filteredServices = signal<OperationListItem[]>([]);
  categories       = signal<string[]>([]);

  showMapView = signal(false);

  selectedCategory = '';
  cityFilter       = '';
  searchText       = '';

  // --- MODAL PRENOTAZIONE ---
  bookingModal   = signal<any | null>(null);  // servizio selezionato
  bookingDate    = '';                         // data scelta dall'utente
  bookingNote    = '';
  bookingLoading = signal(false);
  bookingSuccess = signal(false);
  bookingError   = signal('');

  // data minima = oggi
  get minDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

  constructor(
    private operations: OperationService,
    public auth: AuthService,
    private router: Router,
    private mapService: MapService,
    private prenotazioneService: PrenotazioneService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    this.operations.fetchAllOperations().subscribe({
      next: () => {
        const services = this.operations.Operations();
        this.allServices.set(services);
        this.filteredServices.set(services);
        const cats = [...new Set(services.map((s) => s.category).filter((c): c is string => !!c))];
        this.categories.set(cats);
      },
      error: () => {
        // Se fallisce, mostriamo semplicemente una lista vuota.
      }
    });
  }

  filter() {
    let result = this.allServices();
    if (this.selectedCategory)
      result = result.filter(s => s.category === this.selectedCategory);
    if (this.cityFilter.trim())
      result = result.filter(s => s.city?.toLowerCase().includes(this.cityFilter.toLowerCase()));
    if (this.searchText.trim())
      result = result.filter(s =>
        s.userName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.description?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    this.filteredServices.set(result);
    this.mapService.updateMarkers(result);
  }

  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }

  goToVendor(userId: number) {
    this.router.navigate(['/vendor', userId]);
  }

  // apre il modal di prenotazione
  openBooking(event: Event, service: any) {
    event.stopPropagation();
    this.bookingModal.set(service);
    this.bookingDate    = '';
    this.bookingNote    = '';
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

  openMapView() {
    if (this.showMapView()) return;

    this.showMapView.set(true);

    // aspettiamo che l'elemento map sia visibile
    setTimeout(() => {
      this.mapService.initMap('map', [41.9028, 12.4964], 6);
      this.mapService.updateMarkers(this.filteredServices());
    }, 200);
  }

   ngOnDestroy() {
  this.mapService.destroy();
}
}