import { Routes } from '@angular/router';
import { HomePage } from './home-page/home-page';
import { ProListPreview } from './pro-list-preview/pro-list-preview';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'professionisti', component: ProListPreview },
];