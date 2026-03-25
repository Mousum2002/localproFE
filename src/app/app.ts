import { Component, signal } from '@angular/core';
import { ProListPreview } from './pro-list-preview/pro-list-preview';

@Component({
  selector: 'app-root',
  imports: [ProListPreview],
  template: `
    <div class="w3-container">
      <h1 class="w3-teal w3-padding">LocalPro — Professionisti</h1>
      <app-pro-list-preview />
    </div>
  `
})
export class App {
  protected readonly title = signal('localproFE');
}