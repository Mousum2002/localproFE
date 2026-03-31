import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Auth } from '../auth';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, DatePipe],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {

  firstName = '';
  lastName  = '';
  bio       = '';
  profileImageUrl = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  myBookings = signal<any[]>([]);
  myServices = signal<any[]>([]);

  loading = signal(false);
  success = signal(false);
  error   = signal('');

  private apiUrl      = 'http://localhost:8080/api/users';
  private bookingsUrl = 'http://localhost:8080/api/prenotazioni';   // ← URL CORRETTO
  private vendorUrl   = 'http://localhost:8080/api/vendor-operations';

  constructor(public auth: Auth, private http: HttpClient) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.firstName       = user.firstName    ?? '';
      this.lastName        = user.lastName     ?? '';
      this.bio             = user.bio          ?? '';
      this.profileImageUrl = user.profileImage ?? '';
    }
    this.loadBookings();
    this.loadMyServices();
  }

  // ── PRENOTAZIONI ─────────────────────────────────────────

  loadBookings() {
    // ← ENDPOINT CORRETTO: /api/prenotazioni/getOutoingPrenotazioni
    this.http.get<any[]>(`${this.bookingsUrl}/getOutoingPrenotazioni`, { withCredentials: true })
      .subscribe({
        next: bookings => this.myBookings.set(bookings),
        error: () => {}
      });
  }

  cancelBooking(id: number) {
    if (!confirm('Annullare questa prenotazione?')) return;
    // ← ENDPOINT CORRETTO: DELETE /api/prenotazioni/{id}
    this.http.delete(`${this.bookingsUrl}/${id}`, { withCredentials: true })
      .subscribe(() => this.loadBookings());
  }

  bookingStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'Creato':     '⏳ In attesa',
      'Confermato': '✅ Confermata',
      'Completato': '🏁 Completata',
      'Cancellata': '❌ Annullata',
    };
    return map[status] ?? status;
  }

  bookingStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Creato':     'status-pending',
      'Confermato': 'status-confirmed',
      'Completato': 'status-completed',
      'Cancellata': 'status-cancelled',
    };
    return map[status] ?? '';
  }

  // ── SERVIZI OFFERTI ───────────────────────────────────────

  loadMyServices() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.http.get<any[]>(`${this.vendorUrl}?vendorId=${userId}`, { withCredentials: true })
      .subscribe({
        next: services => this.myServices.set(services),
        error: () => {}
      });
  }

  deleteService(id: number) {
    if (!confirm('Eliminare questo servizio? Non sarà più visibile nella lista.')) return;
    this.http.delete(`${this.vendorUrl}/${id}`, { withCredentials: true })
      .subscribe(() => this.loadMyServices());
  }

  // ── FOTO PROFILO ──────────────────────────────────────────

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      /*
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target?.result as string; };
      reader.readAsDataURL(this.selectedFile);
      */
      const file = input.files[0];

      // Controllo dimensione (opzionale ma consigliato: max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error.set("L'immagine è troppo grande (max 2MB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        // Il risultato è una stringa che inizia con "data:image/png;base64,..."
        const base64String = reader.result as string;
        this.previewUrl = base64String;
        this.profileImageUrl = base64String; // Prepariamo l'immagine per il salvataggio
      };
      reader.readAsDataURL(file);
    }
  }

  // ── SALVA PROFILO ─────────────────────────────────────────

  save() {
    const user = this.auth.currentUser();
    if (!user) {
      this.error.set("Utente non autenticato.");
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    // Prepariamo l'immagine: 
    // 1. Se c'è una previewUrl, significa che l'utente ha appena selezionato un nuovo file (Base64).
    // 2. Altrimenti usiamo la profileImageUrl esistente.
    const finalImage = this.previewUrl || this.profileImageUrl;

    const body: any = {
      id:           user.id,
      userName:     user.userName,
      email:        user.email,
      password:     'UNCHANGED', // O la logica che usa il tuo backend per non sovrascrivere la password
      firstName:    this.firstName,
      lastName:     this.lastName,
      bio:          this.bio,
      city:         user.city    ?? '',
      address:      user.address ?? '',
      x:            user.x       ?? 0,
      y:            user.y       ?? 0,
      profileImage: finalImage, // Qui inviamo la stringa Base64 al DB
    };

    this.http.put(`${this.apiUrl}/${user.id}`, body, { withCredentials: true })
      .subscribe({
        next: (updated: any) => {
          this.loading.set(false);
          this.success.set(true);
          
          // Aggiorniamo l'oggetto utente globale con i nuovi dati ritornati dal server
          const newUser = {
            ...user,
            firstName:    updated.firstName,
            lastName:     updated.lastName,
            bio:          updated.bio,
            profileImage: updated.profileImage,
          };

          // Aggiorniamo il segnale di Auth e la sessione
          this.auth.currentUser.set(newUser);
          sessionStorage.setItem('user', JSON.stringify(newUser));

          // Puliamo la preview temporanea dato che ora l'immagine è salvata ufficialmente
          this.previewUrl = null;
          this.profileImageUrl = updated.profileImage;

          // Messaggio di successo a tempo
          setTimeout(() => this.success.set(false), 3000);
        },
        error: (err) => {
          this.loading.set(false);
          console.error("Errore durante il salvataggio:", err);
          this.error.set('Errore durante il salvataggio. Verifica la dimensione dell\'immagine.');
        },
      });
}


  /*
  save() {
    const user = this.auth.currentUser();
    if (!user) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    const body: any = {
      userName:     user.userName,
      email:        user.email,
      password:     'UNCHANGED',
      firstName:    this.firstName,
      lastName:     this.lastName,
      bio:          this.bio,
      city:         user.city    ?? '',
      address:      user.address ?? '',
      x:            user.x       ?? 0,
      y:            user.y       ?? 0,
      profileImage: this.previewUrl ?? this.profileImageUrl,
    };

    this.http.put(`${this.apiUrl}/${user.id}`, body, { withCredentials: true })
      .subscribe({
        next: (updated: any) => {
          this.loading.set(false);
          this.success.set(true);
          const newUser = {
            ...user,
            bio:          updated.bio,
            firstName:    updated.firstName,
            lastName:     updated.lastName,
            profileImage: updated.profileImage,
          };
          this.auth.currentUser.set(newUser);
          sessionStorage.setItem('user', JSON.stringify(newUser));
          setTimeout(() => this.success.set(false), 3000);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Salvataggio fallito. Riprova.');
        },
      });
    
  }
  */

  // ── GETTERS ───────────────────────────────────────────────

  get initials(): string {
    const f = this.firstName?.[0]?.toUpperCase() ?? '';
    const l = this.lastName?.[0]?.toUpperCase()  ?? '';
    return (f + l) || this.auth.currentUser()?.userName?.[0]?.toUpperCase() || '?';
  }

  get isAdmin(): boolean {
    const roles = this.auth.currentUser()?.roles ?? [];
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }
}