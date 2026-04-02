
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { OperationListItem } from '../model/Operations';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Injectable({ providedIn: 'root' })
export class MapService {
  private map!: L.Map;
  private markersGroup = L.layerGroup();

  constructor(private router: Router) {}

  initMap(elementId: string, center: L.LatLngExpression = [41.9028, 12.4964], zoom = 6): void {
    if (this.map) return; // prevent re-init

    const mapEl = document.getElementById(elementId);
    if (!mapEl) return;

    this.map = L.map(mapEl).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© Non Rispettiamo Il Tuo Privacy:)'
    }).addTo(this.map);

    this.markersGroup.addTo(this.map);
  }

  updateMarkers(services: OperationListItem[]): void {
    if (!this.map) return;
    this.markersGroup.clearLayers();

    services.forEach(s => {
      const lat = s.x;
      const lng = s.y;
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        const marker = L.marker([lat, lng]).bindPopup(
          `<b>${s.userName}</b><br>
           <span style="color:#25a865">${s.category ?? ''}</span><br>
           📍 ${s.city ?? ''}`
        );
        marker.on('click', () => this.router.navigate(['/vendor', s.userId]));
        marker.addTo(this.markersGroup);
      }
    });

    this.fitBoundsToMarkers();
  }

  flyTo(lat: number, lng: number, zoom = 16): void {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom);
    L.marker([lat, lng]).addTo(this.map)
      .bindPopup('📍 Posizione cercata').openPopup();
  }

  destroy(): void {
    this.map?.remove();
    this.map = undefined!;
  }

  private fitBoundsToMarkers(): void {
    const layers: L.Layer[] = [];
    this.markersGroup.eachLayer(l => layers.push(l));
    if (layers.length > 0) {
      const group = L.featureGroup(layers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }
}