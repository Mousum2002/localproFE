import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';
import { ProfilePage } from './profile-page/profile-page';
import { AdminPage } from './admin-page/admin-page';
import { ServicePage } from './service-page/service-page';
import { CreateServicePage } from './create-service-page/create-service-page';
import { VendorPage } from './vendor-page/vendor-page';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'profilo', component: ProfilePage, canActivate: [authGuard] },
  { path: 'admin', component: AdminPage, canActivate: [adminGuard] },
  { path: 'servizi', component: ServicePage },
  { path: 'create-service', component: CreateServicePage, canActivate: [authGuard] },
  { path: 'vendor/:id', component: VendorPage },   // ← NUOVO
  { path: '**', redirectTo: '' },
];