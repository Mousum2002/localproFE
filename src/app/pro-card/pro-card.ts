import { Component, input } from '@angular/core';
import { PortalUser } from '../model/entities';

@Component({
  selector: 'app-pro-card',
  standalone: true,
  imports: [],
  templateUrl: './pro-card.html',
  styleUrl: './pro-card.css',
})
export class ProCard {
  portalUser = input.required<PortalUser>();
}