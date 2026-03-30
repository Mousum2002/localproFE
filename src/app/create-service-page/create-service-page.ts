import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-create-service-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './create-service-page.html',
  styleUrl: './create-service-page.css',
})
export class CreateServicePage implements OnInit {

  // Campi del form
  categoryName  = '';   // nome libero della categoria
  description   = '';   // descrizione/presentazione del servizio
  tagsInput     = '';   // tag separati da virgola
  price: number = 0;

  // Suggerimenti categorie esistenti (per l'autocomplete)
  existingTypes = signal<any[]>([]);
  showSuggestions = false;

  loading = signal(false);
  success = signal(false);
  error   = signal('');

  private opTypesUrl = 'http://localhost:8080/api/operation-types';
  private vendorUrl  = 'http://localhost:8080/api/vendor-operations';

  constructor(
    private http: HttpClient,
    private router: Router,
    public auth: Auth
  ) {}

  ngOnInit() {
    // Carica le categorie esistenti per i suggerimenti
    this.http.get<any[]>(this.opTypesUrl, { withCredentials: true })
      .subscribe({ next: types => this.existingTypes.set(types) });
  }

  // Suggerimenti filtrati mentre si digita
  get suggestions(): any[] {
    const q = this.categoryName.toLowerCase().trim();
    if (!q) return [];
    return this.existingTypes().filter(t =>
      t.name.toLowerCase().includes(q)
    ).slice(0, 5);
  }

  selectSuggestion(type: any) {
    this.categoryName  = type.name;
    this.description   = type.description ?? '';
    this.tagsInput     = (type.tags ?? []).join(', ');
    this.showSuggestions = false;
  }

  create() {
    if (!this.categoryName.trim()) {
      this.error.set('Inserisci il nome del servizio.');
      return;
    }
    if (!this.description.trim()) {
      this.error.set('Inserisci una descrizione del tuo servizio.');
      return;
    }
    if (this.price < 0) {
      this.error.set('Il prezzo non può essere negativo.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.error.set('Utente non autenticato.');
      this.loading.set(false);
      return;
    }

    // Controlla se esiste già una categoria con lo stesso nome (case-insensitive)
    const existing = this.existingTypes().find(
      t => t.name.toLowerCase() === this.categoryName.trim().toLowerCase()
    );

    if (existing) {
      // Categoria già esistente → usa direttamente il suo id
      this.createVendorOperation(existing.id);
    } else {
      // Categoria nuova → prima la crea, poi crea il servizio
      const tags = this.tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const typeBody = {
        userId,
        name:        this.categoryName.trim(),
        description: this.description.trim(),
        tags:        tags.length > 0 ? tags : [this.categoryName.trim()],
      };

      this.http.post<any>(this.opTypesUrl, typeBody, { withCredentials: true })
        .subscribe({
          next:  (created) => this.createVendorOperation(created.id),
          error: () => {
            this.loading.set(false);
            this.error.set('Errore durante la creazione della categoria. Riprova.');
          }
        });
    }
  }

  private createVendorOperation(operationTypeId: number) {
    this.http.post(this.vendorUrl, { operationTypeId, price: this.price }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/servizi']), 2000);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Errore durante la pubblicazione del servizio. Riprova.');
        }
      });
  }
}