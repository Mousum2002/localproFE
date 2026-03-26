import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
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
      next: (users) => {
        this.loading.set(false);
        const me = users.find(u => u.userName === this.userName);
        if (me) {
          this.router.navigate(['/']);
        } else {
          this.error.set('Credenziali non valide.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Username o password errati.');
      }
    });
  }
}