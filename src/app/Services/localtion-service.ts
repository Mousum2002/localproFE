
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

export interface Coordinates  {
  x: number;          
  y: number;         
  city?: string;
 source: 'address' | 'ip' | 'browser';
}

@Injectable({ providedIn: 'root' })

//testato
export class LocationService {

  constructor(private http: HttpClient) {}


   getLocationFromIp(): Observable<Coordinates | null> {
    return this.http.get<any>('https://ipapi.co/json/').pipe(
      map(data => ({
        x:    data.latitude  as number,
        y:    data.longitude as number,
        city:   data.city      as string,   
        source: 'ip' as const
      })),
      catchError(() => of(null))
    );
  }

//chiediamo gentilemente; se non da o problemi, prendiamo con forzaa dal ip
 getLocationFromBrowser(): Observable<Coordinates | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by this browser.');
      return this.getLocationFromIp();
    }
    const position$ = new Observable<GeolocationPosition>(observer => {
      navigator.geolocation.getCurrentPosition(
        pos  => { observer.next(pos); observer.complete(); },
        err  => { observer.error(err); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    return position$.pipe(
      switchMap(pos => {
        const x = pos.coords.latitude;
        const y = pos.coords.longitude;

     
        return this.reversGeocode(x, y).pipe(
          map(city => ({ x, y, city, source: 'browser' as const }))
        );
      }),
      catchError(err => {
        // GeolocationPositionError codes:
        // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (err?.code === 1) {
          console.warn('User denied location access.');
          return this.getLocationFromIp();
        } else {
          console.warn('Browser geolocation failed:', err?.message);
          return this.getLocationFromIp();
        }
      })
    );
  }

   private reversGeocode(x: number, y: number): Observable<string | undefined> {
    const url = `https://nominatim.openstreetmap.org/reverse`
      + `?format=jsonv2&lat=${x}&lon=${y}`;

    const headers = new HttpHeaders({ Accept: 'application/json' });

    return this.http.get<any>(url, { headers }).pipe(
      map(data =>
        data?.address?.city    ??
        data?.address?.town    ??
        data?.address?.village ??
        data?.address?.county  ??
        undefined
      ),
      catchError(() => of(undefined))
    );
  }


  getLocationFromAddress(address: string): Observable<Coordinates | null> {

    if (!address?.trim()) return of(null);

    const url = `https://nominatim.openstreetmap.org/search`
      + `?format=jsonv2&limit=1&addressdetails=1`
      + `&q=${encodeURIComponent(address.trim())}`;

    const headers = new HttpHeaders({ Accept: 'application/json' });
  return this.http.get<any[]>(url, { headers }).pipe(
    map(results => {
      if (!results?.length) return null;
      const r = results[0];
      const city =
        r.address?.city    ??
        r.address?.town    ??
        r.address?.village ??
        r.address?.county  ??
        undefined;

      return {
        x:      Number(r.lat),
        y:      Number(r.lon),
        city,
        source: 'address' as const
      };
    }),
    catchError(() => of(null))
  );
  }
}