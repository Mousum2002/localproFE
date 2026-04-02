import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { LocationService } from '../Services/localtion-service';
import { of, switchMap, catchError } from 'rxjs';
import { AuthService, LoggedUser } from '../Services/auth.service';
import { SnackbarService } from '../Services/snackbar.service';


@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css'],
})
export class RegisterPage {

  userName = '';
  email = '';
  password = '';
  confirmPassword = '';
  city = '';
  address = '';

  error = signal<string>('');
  loading = signal<boolean>(false);
  success = signal<boolean>(false);
  firstName: any;
  lastName: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private locationService: LocationService,
    private auth: AuthService,
    private snackbar: SnackbarService
  ) {}

  register() {
    if (!this.userName || !this.email || !this.password) {
      this.error.set('Compila tutti i campi obbligatori.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Le password non coincidono.');
      return;
    }
    if (this.password.length < 8) {
      this.error.set('La password deve avere almeno 8 caratteri.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const addressInput = (this.address ?? '').trim();
    const cityInput = (this.city ?? '').trim();
    const query = [addressInput, cityInput].filter(Boolean).join(', ');

    // Regola: prima validiamo l'indirizzo scritto.
    // Se non è valido, allora chiediamo permesso posizione (browser) e poi IP fallback (interno al service).
    const coords$ = query
      ? this.locationService.getLocationFromAddress(query).pipe(
          switchMap((coords) => coords ? of(coords) : this.locationService.getLocationFromBrowser())
        )
      // Se non ha inserito indirizzo/città, non forziamo la richiesta permessi: lasciamo 0,0.
      : of(null);

    coords$
      .pipe(catchError(() => of(null)))
      .subscribe((coords) => {
        const body = {
          userName: this.userName,
          email: this.email,
          password: this.password,
          city: cityInput || coords?.city || '',
          address: addressInput,
          firstName: this.firstName,
          lastName: this.lastName,
          x: coords?.x ?? 0,
          y: coords?.y ?? 0,
        };

        this.http.post<LoggedUser>(`${environment.apiUrl}/public/register`, body).subscribe({
          next: (user) => {
            this.loading.set(false);
            this.success.set(true);

            // Usa la response del backend per considerare l'utente loggato
            this.auth.setSession(user);
            this.snackbar.show('Registrazione completata con successo!', 'success');

            this.router.navigate(['/']);
          },
          error: () => {
            this.loading.set(false);
            this.error.set('Registrazione fallita. Username o email già in uso.');
            this.snackbar.show(this.error(), 'error');
          },
        });
      });
  }
}