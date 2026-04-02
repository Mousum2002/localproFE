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
import type { Coordinates } from '../Services/localtion-service';


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

  private isValidCoords(c: Coordinates | null): c is Coordinates {
    if (!c) return false;
    const xOk = Number.isFinite(c.x) && c.x !== 0;
    const yOk = Number.isFinite(c.y) && c.y !== 0;
    return xOk && yOk;
  }

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
    // Se NON ha inserito indirizzo/città, chiediamo comunque la posizione (browser) con fallback IP.
    const coords$ = query
      ? this.locationService.getLocationFromAddress(query).pipe(
          switchMap((coords) => this.isValidCoords(coords) ? of(coords) : this.locationService.getLocationFromBrowser())
        )
      : this.locationService.getLocationFromBrowser();

    coords$
      .pipe(catchError(() => of(null)))
      .subscribe((coordsMaybe) => {
        // Ultimo fallback: mai mandare 0/0 o null al backend
        const coords: Coordinates = this.isValidCoords(coordsMaybe)
          ? coordsMaybe
          : { x: 41.9028, y: 12.4964, city: undefined, source: 'ip' }; // Roma (fallback sicuro)

        const body = {
          userName: this.userName,
          email: this.email,
          password: this.password,
          city: cityInput || coords?.city || '',
          address: addressInput,
          firstName: this.firstName,
          lastName: this.lastName,
          x: coords.x,
          y: coords.y,
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