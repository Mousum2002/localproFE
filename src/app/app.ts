import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OperationService } from './Services/operations.service';
import { HeaderComponent } from './layout/header/header.component';
import { AuthService } from './Services/auth.service';
import { SnackbarComponent } from './layout/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SnackbarComponent],
  template: `
    <app-header></app-header>
    <router-outlet />
    <app-snackbar></app-snackbar>
  `
})
export class App implements OnInit {
  constructor(private auth: AuthService, private operations: OperationService) {}

  ngOnInit() {
    this.auth.restoreSession();
    this.operations.fetchAllOperations().subscribe({
      error: () => {
        // Non blocchiamo l'app se la lista servizi fallisce.
      }
    });
  }
}