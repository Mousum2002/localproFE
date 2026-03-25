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
  totalVendors = signal<number>(0);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<OperationType[]>('http://localhost:8080/operationtype')
      .subscribe(types => this.operationTypes.set(types.slice(0, 6)));

    this.http.get<any[]>('http://localhost:8080/portaluser')
      .subscribe(users => {
        this.totalVendors.set(users.filter(u => u.role === 'VENDOR').length);
      });
  }
}