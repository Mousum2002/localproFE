import { Component } from '@angular/core';

@Component({
  selector: 'app-pro-card',
  standalone: true,
  imports: [],
  templateUrl: './pro-card.html',
  styleUrl: './pro-card.css',
})
export class ProCard 
{
  @Input() portalUser: any; // Replace 'any' with your actual User interface/type
}
