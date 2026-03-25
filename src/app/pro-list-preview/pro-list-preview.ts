import { Component } from '@angular/core';
import { ProCard } from '../pro-card/pro-card';

@Component({
  selector: 'app-pro-list-preview',
  imports: [ProCard],
  templateUrl: './pro-list-preview.html',
  styleUrl: './pro-list-preview.css',
})
export class ProListPreview 
{
  portalUser = input.required<PortalUsers[]>();

}
