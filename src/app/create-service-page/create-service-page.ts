import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { OperationService } from '../Services/operations.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../Services/auth.service';

interface OperationType {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
}

@Component({
  selector: 'app-create-service-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-service-page.html',
  styleUrl: './create-service-page.css',
})
export class CreateServicePage implements OnInit {

  // ✅ NUOVO MODELLO
  selectedTypeId: number | null = null;
  selectedType: OperationType | null = null;

  description = '';
  price: number = 0;

  existingTypes = signal<OperationType[]>([]);

  loading = signal(false);
  success = signal(false);
  error   = signal('');

  private opTypesUrl = `${environment.apiUrl}/public/operation-types`;
  private vendorUrl  = `${environment.apiUrl}/api/vendor-operations`;

  constructor(
    private http: HttpClient,
    private router: Router,
    public auth: AuthService,
    private operations: OperationService
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<OperationType[]>(this.opTypesUrl, { withCredentials: true })
      .subscribe({
        next: types => this.existingTypes.set(types)
      });
  }

  // ✅ FIX: metodo mancante
  onTypeSelected(): void {
    if (this.selectedTypeId === -1) {
      this.selectedType = {
        id: -1,
        name: 'Altro'
      };
      return;
    }

    this.selectedType = this.existingTypes()
      .find(t => t.id === this.selectedTypeId) || null;
  }

  create() {
    if (!this.selectedTypeId) {
      this.error.set('Seleziona una categoria.');
      return;
    }

    if (!this.description.trim()) {
      this.error.set('Inserisci una descrizione.');
      return;
    }

    if (this.price < 0) {
      this.error.set('Prezzo non valido.');
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

    // ✅ CASO: categoria esistente
    if (this.selectedTypeId !== -1) {
      this.createVendorOperation(this.selectedTypeId);
      return;
    }

    // ✅ CASO: ALTRO → crea nuova categoria
    const newType = {
      userId,
      name: this.description.substring(0, 30), // fallback semplice
      description: this.description,
      tags: [this.description.split(' ')[0]]
    };

    this.http.post<any>(this.opTypesUrl, newType, { withCredentials: true })
      .subscribe({
        next: created => this.createVendorOperation(created.id),
        error: () => {
          this.loading.set(false);
          this.error.set('Errore creazione categoria.');
        }
      });
  }

  private createVendorOperation(operationTypeId: number) {
    this.operations.createOperation({ operationTypeId, price: this.price }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/servizi']), 2000);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Errore pubblicazione.');
      }
    });
  }
}