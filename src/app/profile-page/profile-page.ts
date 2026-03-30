import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../auth';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {

  firstName = '';
  lastName = '';
  bio = '';
  profileImageUrl = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // per i servizi offerti
  operationTypes = signal<any[]>([]);
  myServices = signal<any[]>([]);
  newServiceTypeId: number | string = '';
  newServicePrice: number = 0;

  loading = signal(false);
  success = signal(false);
  error = signal('');
  serviceError = signal('');
  serviceSuccess = signal(false);

  private apiUrl = 'http://localhost:8080/api/users';
  private vendorUrl = 'http://localhost:8080/api/vendor-operations';
  private opTypesUrl = 'http://localhost:8080/api/operation-types';

  constructor(public auth: Auth, private http: HttpClient) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.firstName = user.firstName ?? '';
      this.lastName  = user.lastName  ?? '';
      this.bio       = user.bio ?? '';
      this.profileImageUrl = user.profileImage ?? '';
    }

    // carica categorie disponibili
    this.http.get<any[]>(this.opTypesUrl)
      .subscribe(types => this.operationTypes.set(types));

    // carica i servizi già associati all'utente
    this.loadMyServices();
  }

  loadMyServices() {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
    this.http.get<any[]>(`${this.vendorUrl}?vendorId=${userId}`, { withCredentials: true })
      .subscribe(services => this.myServices.set(services));
  }

  addService() {
    if (!this.newServiceTypeId) {
      this.serviceError.set('Seleziona una categoria.');
      return;
    }
    if (this.newServicePrice < 0) {
      this.serviceError.set('Il prezzo non può essere negativo.');
      return;
    }

    this.serviceError.set('');
    const body = {
      operationTypeId: Number(this.newServiceTypeId),
      price: this.newServicePrice
    };

    this.http.post(this.vendorUrl, body, { withCredentials: true })
      .subscribe({
        next: () => {
          this.serviceSuccess.set(true);
          this.newServiceTypeId = '';
          this.newServicePrice = 0;
          this.loadMyServices();
          setTimeout(() => this.serviceSuccess.set(false), 3000);
        },
        error: () => this.serviceError.set('Errore durante l\'aggiunta del servizio.')
      });
  }

  removeService(id: number) {
    if (!confirm('Rimuovere questo servizio?')) return;
    this.http.delete(`${this.vendorUrl}/${id}`, { withCredentials: true })
      .subscribe(() => this.loadMyServices());
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

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
      x:            user.x ?? 0,
      y:            user.y ?? 0,
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