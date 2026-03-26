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

  loading = signal(false);
  success = signal(false);
  error = signal('');

  private apiUrl = 'http://localhost:8080/api/users';

  constructor(public auth: Auth, private http: HttpClient) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.firstName = (user as any).firstName ?? '';
      this.lastName  = (user as any).lastName  ?? '';
      this.bio       = user.bio ?? '';
      this.profileImageUrl = (user as any).profileImage ?? '';
    }
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
      roles:        user.roles,
      x:            user.x ?? 0,
      y:            user.y ?? 0,
      profileImage: this.previewUrl ?? this.profileImageUrl,
    };

    this.http
      .put(`${this.apiUrl}/${user.id}`, body, {
        headers: this.auth.getAuthHeader(),
      })
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
    return this.auth.currentUser()?.roles?.includes('ROLE_ADMIN') ?? false;
  }
}