import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  city: string;
  address: string;
  bio: string;
  x: number;
  y: number;
  roles: string[];
}

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {

  userName = '';
  email = '';
  password = '';
  confirmPassword = '';
  city = '';
  address = '';
  bio = '';
  selectedRole: 'USER' | 'VENDOR' = 'USER';

  error = signal<string>('');
  loading = signal<boolean>(false);
  success = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

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

    const body: RegisterRequest = {
      userName: this.userName,
      email: this.email,
      password: this.password,
      city: this.city,
      address: this.address,
      bio: this.bio,
      x: 0,
      y: 0,
      roles: [this.selectedRole]
    };

    this.http.post('http://localhost:8080/public', body).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Registrazione fallita. Username o email già in uso.');
      }
    });
  }
}