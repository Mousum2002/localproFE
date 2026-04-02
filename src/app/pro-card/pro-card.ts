import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pro-card',
  standalone: true,
  templateUrl: './pro-card.html',
  styleUrl: './pro-card.css',
})
export class ProCard {
  portalUser = input.required<any>();
  isAdmin    = input<boolean>(false);

  onBan    = output<number>();
  onUnban  = output<number>();
  onDelete = output<number>();
}