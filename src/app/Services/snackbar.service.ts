import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarState {
  open: boolean;
  message: string;
  type: SnackbarType;
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  state = signal<SnackbarState>({ open: false, message: '', type: 'info' });

  private timer?: number;

  show(message: string, type: SnackbarType = 'info', durationMs = 3000) {
    if (this.timer) window.clearTimeout(this.timer);
    this.state.set({ open: true, message, type });
    this.timer = window.setTimeout(() => this.hide(), durationMs);
  }

  hide() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = undefined;
    this.state.set({ ...this.state(), open: false });
  }
}

