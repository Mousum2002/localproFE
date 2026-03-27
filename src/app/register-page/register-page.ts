import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs';

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

    const body = {
      userName: this.userName,
      email: this.email,
      password: this.password,
      city: this.city,
      address: this.address,
      firstName: this.firstName,
      lastName: this.lastName,
      x: 0,
      y: 0,
    };

    this.http.post('http://localhost:8080/public/register', body).subscribe({
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