import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPage {

  userName = '';
  password = '';
  error = signal<string>('');
  loading = signal<boolean>(false);

  constructor(private auth: Auth, private router: Router) {}

  login() {
    if (!this.userName || !this.password) {
      this.error.set('Inserisci username e password.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.userName, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);  // naviga solo se login ok
      },
      error: (e) => {
        this.loading.set(false);
        console.log(e);
        if (e.status === 401) {
          this.error.set('Username o password errati.');
        } else {
          this.error.set('Errore di connessione. Riprova.');
        }
      }
    });
  }
}