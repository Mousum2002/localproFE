import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-service-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './service-page.html',
  styleUrl: './service-page.css',
})
export class ServicePage implements OnInit {

  allServices = signal<any[]>([]);
  filteredServices = signal<any[]>([]);
  categories = signal<string[]>([]);

  selectedCategory = '';
  cityFilter = '';
  searchText = '';

  constructor(private http: HttpClient, public auth: Auth) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.http.get<any[]>('http://localhost:8080/public/allOperationList')
      .subscribe(services => {
        this.allServices.set(services);
        this.filteredServices.set(services);

        // estrai categorie uniche
        const cats = [...new Set(
          services.map((s: any) => s.category).filter((c: any) => !!c)
        )] as string[];
        this.categories.set(cats);
      });
  }

  filter() {
    let result = this.allServices();

    if (this.selectedCategory) {
      result = result.filter(s => s.category === this.selectedCategory);
    }

    if (this.cityFilter.trim()) {
      result = result.filter(s =>
        s.city?.toLowerCase().includes(this.cityFilter.toLowerCase())
      );
    }

    if (this.searchText.trim()) {
      result = result.filter(s =>
        s.userName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.description?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    this.filteredServices.set(result);
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  bookService(serviceId: number) {
  if (!this.isLoggedIn) return;
  this.http.post('http://localhost:8080/api/prenotazioni',
    { serviceId: serviceId },
    { withCredentials: true }
  ).subscribe({
    next: () => alert('Prenotazione effettuata con successo!'),
    error: () => alert('Errore durante la prenotazione.')
  });
}
}