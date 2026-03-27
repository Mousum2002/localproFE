import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pro-card',
  standalone: true,
  imports: [RouterLink],
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