import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { ProListPreview } from './pro-list-preview/pro-list-preview';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';
import { ProfilePage } from './profile-page/profile-page';
import { AdminPage } from './admin-page/admin-page';
import { ServicePage } from './service-page/service-page';
import { CreateServicePage } from './create-service-page/create-service-page';
import { VendorPage } from './vendor-page/vendor-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'professionisti', component: ProListPreview },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'profilo', component: ProfilePage },
  { path: 'admin', component: AdminPage },
  { path: 'servizi', component: ServicePage },
  { path: 'create-service', component: CreateServicePage },
  { path: 'vendor/:id', component: VendorPage },   // ← NUOVO
  { path: '**', redirectTo: '' },
];