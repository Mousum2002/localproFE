import { Component, input } from '@angular/core';
import { ProCard } from '../pro-card/pro-card';
import { PortalUser } from '../model/entities';

@Component({
  selector: 'app-pro-list-preview',
  imports: [ProCard],
  templateUrl: './pro-list-preview.html',
  styleUrl: './pro-list-preview.css',
})
export class ProListPreview 
{
  portalUser = input.required<PortalUser[]>();

}
