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

  selectedTypeId: number | null = null;  // categoria selezionata dalla lista
  description   = '';
  tagsInput     = '';
  price: number = 0;

  existingTypes = signal<any[]>([]);

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
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.http.get<any[]>(this.opTypesUrl, { withCredentials: true })
      .subscribe({ next: types => this.existingTypes.set(types) });
  }

  // quando si seleziona una categoria precompila descrizione e tag
  onTypeSelected() {
    const type = this.existingTypes().find(t => t.id === Number(this.selectedTypeId));
    if (type) {
      this.description = type.description ?? '';
      this.tagsInput   = (type.tags ?? []).join(', ');
    }
  }

  get selectedType(): any {
    return this.existingTypes().find(t => t.id === Number(this.selectedTypeId));
  }

  create() {
    if (!this.selectedTypeId) {
      this.error.set('Seleziona una categoria di servizio.');
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

    this.http.post(this.vendorUrl,
      { operationTypeId: Number(this.selectedTypeId), price: this.price },
      { withCredentials: true }
    ).subscribe({
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