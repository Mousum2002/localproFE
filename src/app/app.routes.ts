import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { ProListPreview } from './pro-list-preview/pro-list-preview';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';
import { ProfilePage } from './profile-page/profile-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'professionisti', component: ProListPreview },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'profilo', component: ProfilePage },
  { path: '**', redirectTo: '' },
];