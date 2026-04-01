import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';
import * as L from 'leaflet';

// FIX: risolve il problema delle icone mancanti di Leaflet in Angular
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-service-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './service-page.html',
  styleUrl: './service-page.css',
})
export class ServicePage implements OnInit {

  allServices      = signal<any[]>([]);
  filteredServices = signal<any[]>([]);
  categories       = signal<string[]>([]);

  selectedCategory = '';
  cityFilter       = '';
  searchText       = '';

  map!: L.Map;
  markersGroup = L.layerGroup();

  constructor(private http: HttpClient, public auth: Auth, private router: Router) {}

  ngOnInit() { this.loadServices(); }

  loadServices() {
    this.http.get<any[]>('http://localhost:8080/public/allOperationList')
      .subscribe(services => {
        this.allServices.set(services);
        console.log('primo servizio:', services[0]);
        this.filteredServices.set(services);
        const cats = [...new Set(
          services.map((s: any) => s.category).filter((c: any) => !!c)
        )] as string[];
        this.categories.set(cats);

        setTimeout(() => {
          const mapEl = document.getElementById('map');
          if (!mapEl || this.map) return;
          this.map = L.map(mapEl).setView([41.9028, 12.4964], 6);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);
          this.markersGroup.addTo(this.map);
          this.updateMapMarkers(services);
        }, 500);
      });
  }

  filter() {
    let result = this.allServices();
    if (this.selectedCategory)
      result = result.filter(s => s.category === this.selectedCategory);
    if (this.cityFilter.trim())
      result = result.filter(s => s.city?.toLowerCase().includes(this.cityFilter.toLowerCase()));
    if (this.searchText.trim())
      result = result.filter(s =>
        s.userName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.description?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    this.filteredServices.set(result);
    this.updateMapMarkers(result);
  }

  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }

  goToVendor(userId: number) {
    this.router.navigate(['/vendor', userId]);
  }

  bookService(serviceId: number) {
    if (!this.isLoggedIn) return;
    this.http.post(
      'http://localhost:8080/api/prenotazioni',
      { serviceId, note: '' },
      { withCredentials: true }
    ).subscribe({
      next: () => alert('Prenotazione effettuata con successo!'),
      error: () => alert('Errore durante la prenotazione. Riprova.'),
    });
  }

  updateMapMarkers(services: any[]) {
    if (!this.map) return;
    this.markersGroup.clearLayers();

    services.forEach(s => {
      const lat = parseFloat(s.x);
      const lng = parseFloat(s.y);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const marker = L.marker([lat, lng])
          .bindPopup(`
            <b>${s.userName}</b><br>
            <span style="color:#25a865">${s.category ?? ''}</span><br>
            📍 ${s.city ?? ''}<br>
            💶 ${s.price ?? ''}€
          `);
        marker.on('click', () => this.router.navigate(['/vendor', s.userId]));
        marker.addTo(this.markersGroup);
      }
    });

    // centra la mappa sui marker visibili
    const layers: L.Layer[] = [];
    this.markersGroup.eachLayer(l => layers.push(l));
    if (layers.length > 0) {
      const group = L.featureGroup(layers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }
}