import { Component } from '@angular/core';
import { SnackbarService } from '../../Services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  template: `
    @if (snackbar.state().open) {
      <div class="snackbar" [class]="snackbarClass" (click)="snackbar.hide()">
        <span class="snackbar-text">{{ snackbar.state().message }}</span>
      </div>
    }
  `,
  styles: [`
    .snackbar {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translateX(-50%);
      z-index: 2000;
      padding: 0.85rem 1.1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(18, 32, 26, 0.92);
      backdrop-filter: blur(10px);
      color: rgba(255,255,255,0.85);
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      max-width: min(560px, calc(100vw - 32px));
      box-shadow: 0 10px 30px rgba(0,0,0,0.45);
      cursor: pointer;
      animation: popIn 120ms ease-out;
    }
    .snackbar.success { border-color: rgba(129,199,132,0.35); color: #81c784; }
    .snackbar.error   { border-color: rgba(229,115,115,0.35); color: #ff6b7a; }
    .snackbar.info    { border-color: rgba(37,168,101,0.35); color: #4dd98a; }
    .snackbar-text { word-break: break-word; }
    @keyframes popIn {
      from { opacity: 0; transform: translateX(-50%) translateY(8px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `]
})
export class SnackbarComponent {
  constructor(public snackbar: SnackbarService) {}

  get snackbarClass(): string {
    return `snackbar ${this.snackbar.state().type}`;
  }
}

