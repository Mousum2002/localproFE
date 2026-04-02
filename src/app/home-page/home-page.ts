import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OperationType } from '../model/entities';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {

  operationTypes = signal<OperationType[]>([]);
  totalServices   = signal<number>(0);

  constructor(private http: HttpClient) {}

  ngOnInit() {

    this.http.get<any[]>('http://localhost:8089/public/allOperationList')
    .subscribe(operations => {
      // Imposta il totale basandoti sulla lunghezza dell'array ricevuto
      this.totalServices.set(operations.length);

      const preview = operations.slice(0, 6);
      this.operationTypes.set(preview);
    });
  }

  scrollToHowItWorks() {
    const el = document.getElementById('come-funziona');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}